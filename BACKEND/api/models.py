# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from cloudinary.models import CloudinaryField
from django.utils import timezone


class UtilisateurManager(BaseUserManager):
    def create_user(self, nom, prenom, email, password=None, role='etudiant'):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            nom=nom,
            prenom=prenom,
            role=role,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, nom, prenom, email, password=None):
        user = self.create_user(nom, prenom, email, password, role='admin')
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('etudiant', 'Étudiant'),
        ('admin', 'Administrateur'),
    ]
    
    nom = models.CharField(max_length=100, verbose_name="Nom")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    email = models.EmailField(unique=True, verbose_name="Email")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')
    
    # Champs pour Django admin
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']
    objects = UtilisateurManager()

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.role})"

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"


class Filiere(models.Model):
    libelle_fil = models.CharField(max_length=100, verbose_name="Libellé")
    description = models.TextField(verbose_name="Description", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.libelle_fil

    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"


class Etudiant(models.Model):
    NIVEAU_CHOICES = [
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3_GLSI', 'Licence 3 GLSI'),
        ('L3_ASR', 'Licence 3 ASR'),
    ]
    
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='etudiant'
    )
    matricule = models.CharField(max_length=20, unique=True)
    niveau = models.CharField(max_length=10, choices=NIVEAU_CHOICES)
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='etudiants'
    )
    annee_inscription = models.IntegerField(null=True, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.matricule} - {self.utilisateur.prenom} {self.utilisateur.nom}"

    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"


class Matiere(models.Model):
    nom_matiere = models.CharField(max_length=200)
    coef_ue = models.CharField(max_length=10, verbose_name="Coefficient UE")
    niveau = models.CharField(max_length=10, choices=Etudiant.NIVEAU_CHOICES, default='L1')
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name='matieres'
    )
    credits = models.IntegerField(default=3)
    semestre = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom_matiere

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"


# ============================================
# MODÈLE RESSOURCES AVEC VALIDATION ET NOTIFICATIONS
# ============================================

class Ressources(models.Model):
    TYPE_CHOICES = [
        ('cours', '📚 Cours'),
        ('td', '✏️ Travaux Dirigés'),
        ('tp', '💻 Travaux Pratiques'),
        ('examen', '📝 Examen'),
        ('autre', '📎 Autre'),
    ]
    
    STATUT_CHOICES = [
        ('en_attente', '⏳ En attente de validation'),
        ('valide', '✅ Validé'),
        ('refuse', '❌ Refusé'),
    ]
    
    # Informations de base
    titres_ressources = models.CharField(max_length=255, verbose_name="Titre")
    type_ressources = models.CharField(max_length=50, choices=TYPE_CHOICES)
    url = CloudinaryField(resource_type='raw', verbose_name="Fichier ZIP")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    # Validation
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    commentaire_refus = models.TextField(blank=True, null=True, verbose_name="Motif du refus")
    
    # Dates
    date_soumission = models.DateTimeField(auto_now_add=True, verbose_name="Date de soumission")
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    
    # Relations
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='ressources',
        verbose_name="Soumis par"
    )
    matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        related_name='ressources'
    )
    valide_par = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ressources_validees',
        verbose_name="Validé par"
    )
    
    # Métadonnées
    version = models.CharField(max_length=10, default='1.0')
    nombre_telechargements = models.IntegerField(default=0)
    notification_envoyee = models.BooleanField(default=False, verbose_name="Notification envoyée")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titres_ressources} ({self.get_statut_display()})"

    def valider(self, admin_user):
        """Valider la ressource et envoyer une notification"""
        self.statut = 'valide'
        self.date_validation = timezone.now()
        self.valide_par = admin_user
        self.save()
        self._envoyer_notification_validee()

    def refuser(self, admin_user, commentaire):
        """Refuser la ressource et envoyer une notification"""
        self.statut = 'refuse'
        self.date_validation = timezone.now()
        self.valide_par = admin_user
        self.commentaire_refus = commentaire
        self.save()
        self._envoyer_notification_refusee()

    def _envoyer_notification_validee(self):
        """Envoyer un email à l'auteur pour l'informer que sa ressource est validée"""
        if self.notification_envoyee:
            return
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        sujet = f"✅ Votre ressource '{self.titres_ressources}' a été validée"
        message = f"""
Bonjour {self.utilisateur.prenom} {self.utilisateur.nom},

Félicitations ! Votre ressource '{self.titres_ressources}' a été validée par l'administrateur.

📚 Détails :
- Titre : {self.titres_ressources}
- Matière : {self.matiere.nom_matiere}
- Type : {self.get_type_ressources_display()}
- Date de validation : {self.date_validation.strftime('%d/%m/%Y à %H:%M')}

Votre ressource est maintenant disponible pour tous les étudiants.

Lien : {self.url.url}

Cordialement,
L'équipe pédagogique
"""
        
        try:
            send_mail(
                sujet,
                message,
                settings.DEFAULT_FROM_EMAIL or 'noreply@iai-education.com',
                [self.utilisateur.email],
                fail_silently=False,
            )
            self.notification_envoyee = True
            self.save(update_fields=['notification_envoyee'])
        except Exception as e:
            print(f"Erreur envoi email: {e}")

    def _envoyer_notification_refusee(self):
        """Envoyer un email à l'auteur pour l'informer que sa ressource est refusée"""
        if self.notification_envoyee:
            return
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        sujet = f"❌ Votre ressource '{self.titres_ressources}' a été refusée"
        message = f"""
Bonjour {self.utilisateur.prenom} {self.utilisateur.nom},

Votre ressource '{self.titres_ressources}' a été refusée par l'administrateur.

📚 Détails :
- Titre : {self.titres_ressources}
- Matière : {self.matiere.nom_matiere}
- Type : {self.get_type_ressources_display()}
- Date : {self.date_validation.strftime('%d/%m/%Y à %H:%M')}

❌ Motif du refus :
{self.commentaire_refus if self.commentaire_refus else "Aucun motif spécifié"}

Vous pouvez modifier votre ressource et la soumettre à nouveau.

Cordialement,
L'équipe pédagogique
"""
        
        try:
            send_mail(
                sujet,
                message,
                settings.DEFAULT_FROM_EMAIL or 'noreply@iai-education.com',
                [self.utilisateur.email],
                fail_silently=False,
            )
            self.notification_envoyee = True
            self.save(update_fields=['notification_envoyee'])
        except Exception as e:
            print(f"Erreur envoi email: {e}")

    class Meta:
        verbose_name = "Ressource"
        verbose_name_plural = "Ressources"
        ordering = ['-date_soumission']


class DocumentStage(models.Model):
    TYPE_DOCUMENT = [
        ('convention', '📄 Convention de stage'),
        ('rapport', '📑 Rapport de stage'),
        ('attestation', '📜 Attestation'),
        ('autre', '📎 Autre'),
    ]
    
    titre = models.CharField(max_length=255)
    type_document = models.CharField(max_length=20, choices=TYPE_DOCUMENT, default='rapport')
    url_document = models.URLField(max_length=500)
    est_modele_officiel = models.BooleanField(default=False)
    
    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='documents_stage'
    )
    
    est_valide = models.BooleanField(default=False)
    commentaire_admin = models.TextField(blank=True, null=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titre

    class Meta:
        verbose_name = "Document de stage"
        verbose_name_plural = "Documents de stage"