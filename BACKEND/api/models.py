from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from cloudinary.models import CloudinaryField

class UtilisateurManager(BaseUserManager):
    def create_user(self, nom, prenom, email, password=None, role='etudiant'):
        if not email:
            raise ValueError("L'email est obligatoire")
        user = self.model(
            email=self.normalize_email(email),
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
        ('etudiant', 'Etudiant'),
        ('admin', 'Administrateur'),
    ]
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

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

    def __str__(self):
        return self.libelle_fil

    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"

class Etudiant(Utilisateur):
    Niveau_CHOICES = [
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
    ]
    matricule = models.CharField(max_length=20, unique=True)
    niveau = models.CharField(max_length=10, choices=Niveau_CHOICES)
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='etudiants'
    )

    def __str__(self):
        return f"{self.matricule} - {self.prenom} {self.nom}"

    class Meta:
        verbose_name = "Etudiant"
        verbose_name_plural = "Etudiants"

class Matiere(models.Model):
    nom_matiere = models.CharField(max_length=200)
    coef_ue = models.DecimalField(max_digits=3, decimal_places=2, verbose_name="Coefficient UE")
    filiere = models.ForeignKey(        
        Filiere,
        on_delete=models.CASCADE,
        related_name='matieres'
    )

    def __str__(self):
        return self.nom_matiere

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"

class Ressources(models.Model):
    TYPE_CHOICES = [
        ('cours', 'Cours'),
        ('td', 'TD'),
        ('tp', 'TP'),
        ('examen', 'Examen'),
        ('autre', 'Autre'),
    ]
    titres_ressources = models.CharField(max_length=255, verbose_name="Titre")
    type_ressources = models.CharField(max_length=20, choices=TYPE_CHOICES)
    url = CloudinaryField('zip', resource_type='raw')  
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='ressources'
    )
    matiere = models.ForeignKey(        
        Matiere,
        on_delete=models.CASCADE,
        related_name='ressources'
    )

    def __str__(self):
        return self.titres_ressources

    class Meta:
        verbose_name = "Ressource"
        verbose_name_plural = "Ressources"

class DocumentStage(models.Model):
    titre = models.CharField(max_length=255)
    url_document = models.URLField(max_length=500)
    est_modele_officiel = models.BooleanField(default=False)
    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='documents_stage'
    )

    def __str__(self):
        return self.titre

    class Meta:
        verbose_name = "Document de stage"
        verbose_name_plural = "Documents de stage"