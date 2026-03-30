# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage

class UtilisateurSerializer(serializers.ModelSerializer):
    """Convertit Utilisateur en JSON"""
    
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Utilisateur
        fields = ['id', 'nom', 'prenom', 'email', 'role', 'nom_complet']
        read_only_fields = ['id']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


class RegisterSerializer(serializers.ModelSerializer):
    """Pour l'inscription d'un nouvel étudiant"""
    
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = Utilisateur
        fields = ['nom', 'prenom', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        """Vérifie que les mots de passe correspondent"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        """Crée l'utilisateur avec le rôle 'etudiant'"""
        validated_data.pop('password_confirm')
        validated_data['role'] = 'etudiant'
        validated_data['password'] = make_password(validated_data.pop('password'))
        return Utilisateur.objects.create(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Pour la connexion"""
    email = serializers.EmailField()
    password = serializers.CharField()


class FiliereSerializer(serializers.ModelSerializer):
    """Convertit Filiere en JSON"""
    
    nombre_etudiants = serializers.IntegerField(read_only=True)
    nombre_matieres = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Filiere
        fields = ['id', 'libelle_fil', 'description', 'nombre_etudiants', 'nombre_matieres']


class EtudiantSerializer(serializers.ModelSerializer):
    """Convertit Etudiant en JSON avec les infos utilisateur"""
    
    nom = serializers.ReadOnlyField(source='utilisateur.nom')
    prenom = serializers.ReadOnlyField(source='utilisateur.prenom')
    email = serializers.ReadOnlyField(source='utilisateur.email')
    nom_complet = serializers.SerializerMethodField()
    filiere_nom = serializers.ReadOnlyField(source='filiere.libelle_fil')
    
    class Meta:
        model = Etudiant
        fields = ['matricule', 'niveau', 'filiere', 'filiere_nom', 
                  'utilisateur', 'nom', 'prenom', 'email', 'nom_complet']
        depth = 1
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"

class MatiereSerializer(serializers.ModelSerializer):
    """Convertit Matiere en JSON"""
    
    filiere_nom = serializers.ReadOnlyField(source='filiere.libelle_fil')
    nombre_ressources = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Matiere
        fields = ['id', 'nom_matiere', 'coef_ue', 'filiere', 'filiere_nom', 'nombre_ressources']

class RessourcesSerializer(serializers.ModelSerializer):
    """Convertit Ressources en JSON"""
    
    type_display = serializers.ReadOnlyField(source='get_type_ressources_display')
    matiere_nom = serializers.ReadOnlyField(source='matiere.nom_matiere')
    utilisateur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Ressources
        fields = ['id', 'titres_ressources', 'type_ressources', 'type_display',
                  'url', 'utilisateur', 'utilisateur_nom', 'matiere', 'matiere_nom']
    
    def get_utilisateur_nom(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"


class RessourcesUploadSerializer(serializers.ModelSerializer):
    """Pour l'upload d'un ZIP"""
    
    class Meta:
        model = Ressources
        fields = ['titres_ressources', 'type_ressources', 'url', 'matiere']

class DocumentStageSerializer(serializers.ModelSerializer):
    """Convertit DocumentStage en JSON"""
    
    etudiant_nom = serializers.SerializerMethodField()
    etudiant_matricule = serializers.ReadOnlyField(source='etudiant.matricule')
    
    class Meta:
        model = DocumentStage
        fields = ['id', 'titre', 'url_document', 'est_modele_officiel', 
                  'etudiant', 'etudiant_nom', 'etudiant_matricule']
    
    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.prenom} {obj.etudiant.nom}"


class DocumentStageUploadSerializer(serializers.ModelSerializer):
    """Pour l'upload d'un document de stage"""
    
    class Meta:
        model = DocumentStage
        fields = ['titre', 'url_document', 'est_modele_officiel', 'etudiant']