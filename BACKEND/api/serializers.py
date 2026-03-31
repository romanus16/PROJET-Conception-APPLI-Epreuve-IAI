# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage


class UtilisateurSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Utilisateur
        fields = ['id', 'nom', 'prenom', 'email', 'role', 'nom_complet']
        read_only_fields = ['id']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    # Champs optionnels pour créer le profil étudiant simultanément
    matricule = serializers.CharField(required=False, write_only=True)
    niveau = serializers.ChoiceField(choices=Etudiant.NIVEAU_CHOICES, required=False, write_only=True)
    filiere = serializers.PrimaryKeyRelatedField(queryset=Filiere.objects.all(), required=False, write_only=True)
    
    class Meta:
        model = Utilisateur
        fields = ['nom', 'prenom', 'email', 'password', 'password_confirm', 'matricule', 'niveau', 'filiere']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        if 'matricule' in data and Etudiant.objects.filter(matricule=data['matricule']).exists():
            raise serializers.ValidationError({"matricule": "Ce matricule est déjà utilisé."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Extraction des données étudiant
        matricule = validated_data.pop('matricule', None)
        niveau = validated_data.pop('niveau', None)
        filiere = validated_data.pop('filiere', None)
        
        # Création de l'utilisateur via le manager pour le hachage du mot de passe
        user = Utilisateur.objects.create_user(**validated_data, role='etudiant')
        
        # Création automatique du profil étudiant si les infos sont présentes
        if matricule and niveau:
            Etudiant.objects.create(utilisateur=user, matricule=matricule, niveau=niveau, filiere=filiere)
            
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class FiliereSerializer(serializers.ModelSerializer):
    nombre_etudiants = serializers.IntegerField(read_only=True)
    nombre_matieres = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Filiere
        fields = ['id', 'libelle_fil', 'description', 'nombre_etudiants', 'nombre_matieres']


class EtudiantSerializer(serializers.ModelSerializer):
    nom = serializers.ReadOnlyField(source='utilisateur.nom')
    prenom = serializers.ReadOnlyField(source='utilisateur.prenom')
    email = serializers.ReadOnlyField(source='utilisateur.email')
    filiere_nom = serializers.ReadOnlyField(source='filiere.libelle_fil')
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Etudiant
        fields = ['id', 'matricule', 'niveau', 'filiere', 'filiere_nom', 
                  'utilisateur', 'nom', 'prenom', 'email', 'nom_complet',
                  'annee_inscription', 'telephone', 'adresse']
        depth = 1
    
    def get_nom_complet(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"


class MatiereSerializer(serializers.ModelSerializer):
    filiere_nom = serializers.ReadOnlyField(source='filiere.libelle_fil')
    nombre_ressources = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Matiere
        fields = ['id', 'nom_matiere', 'coef_ue', 'niveau', 'filiere', 'filiere_nom', 
                  'credits', 'semestre', 'description', 'nombre_ressources']


class RessourcesSerializer(serializers.ModelSerializer):
    type_display = serializers.ReadOnlyField(source='get_type_ressources_display')
    statut_display = serializers.ReadOnlyField(source='get_statut_display')
    matiere_nom = serializers.ReadOnlyField(source='matiere.nom_matiere')
    auteur_nom = serializers.SerializerMethodField()
    auteur_id = serializers.ReadOnlyField(source='utilisateur.id')
    
    class Meta:
        model = Ressources
        fields = ['id', 'titres_ressources', 'type_ressources', 'type_display',
                  'url', 'description', 'matiere', 'matiere_nom', 
                  'statut', 'statut_display', 'commentaire_refus',
                  'auteur_nom', 'auteur_id', 'date_soumission',
                  'date_validation', 'nombre_telechargements']
        read_only_fields = ['id', 'statut', 'commentaire_refus', 'date_validation', 
                           'date_soumission', 'nombre_telechargements']
    
    def get_auteur_nom(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"


class RessourcesUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ressources
        fields = ['id', 'titres_ressources', 'type_ressources', 'url', 'matiere', 'description']


class RessourcesValidationSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=[('valider', 'Valider'), ('refuser', 'Refuser')])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class DocumentStageSerializer(serializers.ModelSerializer):
    type_display = serializers.ReadOnlyField(source='get_type_document_display')
    etudiant_nom = serializers.SerializerMethodField()
    etudiant_matricule = serializers.ReadOnlyField(source='etudiant.matricule')
    
    class Meta:
        model = DocumentStage
        fields = ['id', 'titre', 'type_document', 'type_display', 'url_document',
                  'est_modele_officiel', 'etudiant', 'etudiant_nom', 
                  'etudiant_matricule', 'est_valide', 'commentaire_admin',
                  'date_validation', 'created_at', 'updated_at']
        read_only_fields = ['est_valide', 'commentaire_admin', 'date_validation', 'created_at']
    
    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.utilisateur.prenom} {obj.etudiant.utilisateur.nom}"


class DocumentStageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentStage
        fields = ['id', 'titre', 'type_document', 'url_document', 'est_modele_officiel', 'etudiant']