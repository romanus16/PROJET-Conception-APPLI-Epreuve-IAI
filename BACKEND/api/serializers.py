# api/serializers.py
from rest_framework import serializers
from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage


class UtilisateurSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model  = Utilisateur
        fields = ['id', 'nom', 'prenom', 'email', 'role', 'nom_complet']
        read_only_fields = ['id']

    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)   # ← nom aligné avec le frontend

    # Champs étudiant — tous optionnels
    matricule = serializers.CharField(required=False, allow_blank=True, write_only=True)
    niveau    = serializers.ChoiceField(
        choices=Etudiant.NIVEAU_CHOICES, required=False, write_only=True
    )
    filiere   = serializers.PrimaryKeyRelatedField(
        queryset=Filiere.objects.all(), required=False, allow_null=True, write_only=True
    )

    class Meta:
        model  = Utilisateur
        fields = [
            'nom', 'prenom', 'email',
            'password', 'password_confirm',
            'matricule', 'niveau', 'filiere',
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas"}
            )
        matricule = data.get('matricule', '').strip()
        if matricule and Etudiant.objects.filter(matricule=matricule).exists():
            raise serializers.ValidationError(
                {"matricule": "Ce matricule est déjà utilisé."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        matricule = validated_data.pop('matricule', '').strip()
        niveau    = validated_data.pop('niveau', 'L1')
        filiere   = validated_data.pop('filiere', None)

        # Création de l'utilisateur (mot de passe haché via le manager)
        user = Utilisateur.objects.create_user(
            **validated_data,
            role='etudiant'
        )

        # Création du profil étudiant
        # — avec matricule s'il est fourni, sinon on en génère un temporaire
        if not matricule:
            matricule = f"IAI{user.id:06d}"

        Etudiant.objects.create(
            utilisateur=user,
            matricule=matricule,
            niveau=niveau,
            filiere=filiere,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()


class FiliereSerializer(serializers.ModelSerializer):
    nombre_etudiants = serializers.IntegerField(read_only=True)
    nombre_matieres  = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Filiere
        fields = ['id', 'libelle_fil', 'description', 'nombre_etudiants', 'nombre_matieres']


class EtudiantSerializer(serializers.ModelSerializer):
    nom      = serializers.ReadOnlyField(source='utilisateur.nom')
    prenom   = serializers.ReadOnlyField(source='utilisateur.prenom')
    email    = serializers.ReadOnlyField(source='utilisateur.email')
    filiere_nom  = serializers.ReadOnlyField(source='filiere.libelle_fil')
    nom_complet  = serializers.SerializerMethodField()
    utilisateur  = UtilisateurSerializer(read_only=True)

    class Meta:
        model  = Etudiant
        fields = [
            'id', 'matricule', 'niveau', 'filiere', 'filiere_nom',
            'utilisateur', 'nom', 'prenom', 'email', 'nom_complet',
            'annee_inscription', 'telephone', 'adresse',
        ]

    def get_nom_complet(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"


class MatiereSerializer(serializers.ModelSerializer):
    filiere_nom       = serializers.ReadOnlyField(source='filiere.libelle_fil')
    nombre_ressources = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Matiere
        fields = [
            'id', 'nom_matiere', 'coef_ue', 'niveau',
            'filiere', 'filiere_nom', 'credits', 'semestre',
            'description', 'nombre_ressources',
        ]


class RessourcesSerializer(serializers.ModelSerializer):
    type_display   = serializers.ReadOnlyField(source='get_type_ressources_display')
    statut_display = serializers.ReadOnlyField(source='get_statut_display')
    filiere_display = serializers.ReadOnlyField(source='get_filiere_display')
    matiere_nom    = serializers.ReadOnlyField(source='matiere.nom_matiere')
    auteur_nom     = serializers.SerializerMethodField()
    auteur_id      = serializers.ReadOnlyField(source='utilisateur.id')
    utilisateur    = UtilisateurSerializer(read_only=True)
    matiere        = MatiereSerializer(read_only=True)

    class Meta:
        model  = Ressources
        fields = [
            'id', 'titres_ressources', 'type_ressources', 'type_display',
            'filiere', 'filiere_display', 'url', 'description', 'matiere', 'matiere_nom',
            'statut', 'statut_display', 'commentaire_refus',
            'auteur_nom', 'auteur_id', 'utilisateur',
            'date_soumission', 'date_validation', 'nombre_telechargements',
        ]
        read_only_fields = [
            'id', 'statut', 'commentaire_refus', 'date_validation',
            'date_soumission', 'nombre_telechargements',
        ]

    def get_auteur_nom(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"


class RessourcesUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Ressources
        fields = ['id', 'titres_ressources', 'type_ressources', 'filiere', 'url', 'matiere', 'description']


class RessourcesValidationSerializer(serializers.Serializer):
    action      = serializers.ChoiceField(choices=[('valider', 'Valider'), ('refuser', 'Refuser')])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class DocumentStageSerializer(serializers.ModelSerializer):
    type_display       = serializers.ReadOnlyField(source='get_type_document_display')
    etudiant_nom       = serializers.SerializerMethodField()
    etudiant_matricule = serializers.ReadOnlyField(source='etudiant.matricule')

    class Meta:
        model  = DocumentStage
        fields = [
            'id', 'titre', 'type_document', 'type_display', 'url_document',
            'est_modele_officiel', 'etudiant', 'etudiant_nom',
            'etudiant_matricule', 'est_valide', 'commentaire_admin',
            'date_validation', 'created_at', 'updated_at',
        ]
        read_only_fields = ['est_valide', 'commentaire_admin', 'date_validation', 'created_at']

    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.utilisateur.prenom} {obj.etudiant.utilisateur.nom}"


class DocumentStageUploadSerializer(serializers.ModelSerializer):
    est_modele_officiel = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model  = DocumentStage
        fields = ['id', 'titre', 'type_document', 'url_document', 'est_modele_officiel', 'etudiant']
        read_only_fields = ['id', 'etudiant']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)