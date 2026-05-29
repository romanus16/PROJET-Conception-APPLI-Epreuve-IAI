# api/tests.py
import os
import tempfile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage
from django.utils import timezone

# Helper to create test files
def create_test_zip():
    return SimpleUploadedFile(
        "test.zip",
        b"fake zip content",
        content_type="application/zip"
    )

def create_test_pdf():
    return SimpleUploadedFile(
        "test.pdf",
        b"fake pdf content",
        content_type="application/pdf"
    )

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_superuser(
            nom='Admin', prenom='Test', email='admin@test.com', password='admin123'
        )
        self.student = Utilisateur.objects.create_user(
            nom='Student', prenom='Test', email='student@test.com', password='student123', role='etudiant'
        )

        # Create student profile
        filiere = Filiere.objects.create(libelle_fil='Informatique', description='Test filiere')
        self.student_profile = Etudiant.objects.create(
            utilisateur=self.student,
            matricule='STU001',
            niveau='L1',
            filiere=filiere,
            annee_inscription=2023
        )

    def test_register(self):
        """Test user registration"""
        data = {
            'nom': 'New',
            'prenom': 'User',
            'email': 'new@test.com',
            'password': 'password123',
            'role': 'etudiant'
        }
        response = self.client.post(reverse('register'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access_token' in response.data['data'])

    def test_login(self):
        """Test user login"""
        data = {'email': 'student@test.com', 'password': 'student123'}
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access_token' in response.data['data'])

    def test_me(self):
        """Test get current user info"""
        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], 'student@test.com')

class FiliereTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_superuser(
            nom='Admin', prenom='Test', email='admin@test.com', password='admin123'
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_filiere(self):
        """Test filiere creation"""
        data = {'libelle_fil': 'GLSI', 'description': 'Génie Logiciel'}
        response = self.client.post(reverse('create_filiere'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Filiere.objects.count(), 1)

    def test_list_filieres(self):
        """Test filiere listing"""
        Filiere.objects.create(libelle_fil='GLSI', description='Génie Logiciel')
        Filiere.objects.create(libelle_fil='ASR', description='Administration Systèmes')
        response = self.client.get(reverse('get_filieres'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 2)

class MatiereTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_superuser(
            nom='Admin', prenom='Test', email='admin@test.com', password='admin123'
        )
        self.client.force_authenticate(user=self.admin)
        self.filiere = Filiere.objects.create(libelle_fil='Informatique')

    def test_create_matiere(self):
        """Test matiere creation"""
        data = {
            'nom_matiere': 'Programmation Python',
            'coef_ue': '3',
            'niveau': 'L1',
            'filiere': self.filiere.id,
            'credits': 3,
            'semestre': 1
        }
        response = self.client.post(reverse('create_matiere'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Matiere.objects.count(), 1)

    def test_list_matieres(self):
        """Test matiere listing"""
        Matiere.objects.create(
            nom_matiere='Python', coef_ue='3', niveau='L1',
            filiere=self.filiere, credits=3, semestre=1
        )
        Matiere.objects.create(
            nom_matiere='Java', coef_ue='4', niveau='L2',
            filiere=self.filiere, credits=4, semestre=2
        )
        response = self.client.get(reverse('get_matieres'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 2)

class RessourcesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_superuser(
            nom='Admin', prenom='Test', email='admin@test.com', password='admin123'
        )
        self.student = Utilisateur.objects.create_user(
            nom='Student', prenom='Test', email='student@test.com', password='student123', role='etudiant'
        )

        # Create student profile and matiere
        filiere = Filiere.objects.create(libelle_fil='Informatique')
        self.student_profile = Etudiant.objects.create(
            utilisateur=self.student,
            matricule='STU001',
            niveau='L1',
            filiere=filiere,
            annee_inscription=2023
        )
        self.matiere = Matiere.objects.create(
            nom_matiere='Python', coef_ue='3', niveau='L1',
            filiere=filiere, credits=3, semestre=1
        )

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_upload_ressource_student(self):
        """Test student resource upload (should be en_attente)"""
        self.client.force_authenticate(user=self.student)
        zip_file = create_test_zip()

        data = {
            'titres_ressources': 'Cours Python',
            'type_ressources': 'cours',
            'filiere': 'L1',
            'url': zip_file,
            'description': 'Cours complet de Python',
            'matiere': self.matiere.id
        }

        response = self.client.post(reverse('upload_ressource'), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ressources.objects.count(), 1)

        ressource = Ressources.objects.first()
        self.assertEqual(ressource.statut, 'en_attente')
        self.assertEqual(ressource.utilisateur, self.student)

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_upload_ressource_admin(self):
        """Test admin resource upload (should be valide)"""
        self.client.force_authenticate(user=self.admin)
        zip_file = create_test_zip()

        data = {
            'titres_ressources': 'Cours Python Admin',
            'type_ressources': 'cours',
            'filiere': 'L1',
            'url': zip_file,
            'description': 'Cours admin',
            'matiere': self.matiere.id
        }

        response = self.client.post(reverse('upload_ressource'), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ressources.objects.count(), 1)

        ressource = Ressources.objects.first()
        self.assertEqual(ressource.statut, 'valide')
        self.assertEqual(ressource.utilisateur, self.admin)

    def test_list_ressources_student(self):
        """Test student can only see validated resources"""
        self.client.force_authenticate(user=self.student)

        # Create validated and pending resources
        validated = Ressources.objects.create(
            titres_ressources='Validated',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test1.zip',
            statut='valide',
            utilisateur=self.admin,
            matiere=self.matiere,
            date_validation=timezone.now(),
            valide_par=self.admin
        )

        pending = Ressources.objects.create(
            titres_ressources='Pending',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test2.zip',
            statut='en_attente',
            utilisateur=self.student,
            matiere=self.matiere
        )

        response = self.client.get(reverse('get_ressources'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)  # Only validated
        self.assertEqual(response.data['data'][0]['titres_ressources'], 'Validated')

    def test_list_ressources_admin(self):
        """Test admin can see all resources"""
        self.client.force_authenticate(user=self.admin)

        validated = Ressources.objects.create(
            titres_ressources='Validated',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test1.zip',
            statut='valide',
            utilisateur=self.admin,
            matiere=self.matiere,
            date_validation=timezone.now(),
            valide_par=self.admin
        )

        pending = Ressources.objects.create(
            titres_ressources='Pending',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test2.zip',
            statut='en_attente',
            utilisateur=self.student,
            matiere=self.matiere
        )

        response = self.client.get(reverse('get_ressources'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 2)  # Both resources

    def test_validate_ressource(self):
        """Test admin can validate a resource"""
        self.client.force_authenticate(user=self.admin)

        pending = Ressources.objects.create(
            titres_ressources='Pending',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test.zip',
            statut='en_attente',
            utilisateur=self.student,
            matiere=self.matiere
        )

        data = {'action': 'valider'}
        response = self.client.post(reverse('valider_ressource', args=[pending.id]), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        pending.refresh_from_db()
        self.assertEqual(pending.statut, 'valide')
        self.assertEqual(pending.valide_par, self.admin)

    def test_refuse_ressource(self):
        """Test admin can refuse a resource"""
        self.client.force_authenticate(user=self.admin)

        pending = Ressources.objects.create(
            titres_ressources='Bad Resource',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test.zip',
            statut='en_attente',
            utilisateur=self.student,
            matiere=self.matiere
        )

        data = {'action': 'refuser', 'commentaire': 'Qualité insuffisante'}
        response = self.client.post(reverse('valider_ressource', args=[pending.id]), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        pending.refresh_from_db()
        self.assertEqual(pending.statut, 'refuse')
        self.assertEqual(pending.commentaire_refus, 'Qualité insuffisante')

class DocumentStageTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Utilisateur.objects.create_user(
            nom='Student', prenom='Test', email='student@test.com', password='student123', role='etudiant'
        )

        filiere = Filiere.objects.create(libelle_fil='Informatique')
        self.student_profile = Etudiant.objects.create(
            utilisateur=self.student,
            matricule='STU001',
            niveau='L1',
            filiere=filiere,
            annee_inscription=2023
        )
        self.client.force_authenticate(user=self.student)

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_upload_document_stage(self):
        """Test student can upload stage document"""
        pdf_file = create_test_pdf()

        data = {
            'titre': 'Convention de stage',
            'type_document': 'convention',
            'url_document': pdf_file,
            'est_modele_officiel': False
        }

        response = self.client.post(reverse('upload_document_stage'), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DocumentStage.objects.count(), 1)

        doc = DocumentStage.objects.first()
        self.assertEqual(doc.etudiant, self.student_profile)
        self.assertEqual(doc.titre, 'Convention de stage')

    def test_list_documents_stage(self):
        """Test student can only see their own documents"""
        # Create document for our student
        doc1 = DocumentStage.objects.create(
            titre='Mon rapport',
            type_document='rapport',
            url_document='documents/test1.pdf',
            est_modele_officiel=False,
            etudiant=self.student_profile
        )

        # Create document for another student
        other_student = Utilisateur.objects.create_user(
            nom='Other', prenom='Student', email='other@test.com', password='other123', role='etudiant'
        )
        other_profile = Etudiant.objects.create(
            utilisateur=other_student,
            matricule='STU002',
            niveau='L1',
            filiere=self.student_profile.filiere,
            annee_inscription=2023
        )

        doc2 = DocumentStage.objects.create(
            titre='Autre rapport',
            type_document='rapport',
            url_document='documents/test2.pdf',
            est_modele_officiel=False,
            etudiant=other_profile
        )

        response = self.client.get(reverse('get_documents_stage'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)  # Only their own
        self.assertEqual(response.data['data'][0]['titre'], 'Mon rapport')

class StatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_superuser(
            nom='Admin', prenom='Test', email='admin@test.com', password='admin123'
        )
        self.client.force_authenticate(user=self.admin)

        # Create test data
        filiere = Filiere.objects.create(libelle_fil='Informatique')
        matiere = Matiere.objects.create(
            nom_matiere='Python', coef_ue='3', niveau='L1',
            filiere=filiere, credits=3, semestre=1
        )

        student = Utilisateur.objects.create_user(
            nom='Student', prenom='Test', email='student@test.com', password='student123', role='etudiant'
        )
        student_profile = Etudiant.objects.create(
            utilisateur=student,
            matricule='STU001',
            niveau='L1',
            filiere=filiere,
            annee_inscription=2023
        )

        # Create resources
        Ressources.objects.create(
            titres_ressources='Validated',
            type_ressources='cours',
            filiere='L1',
            url='ressources/test1.zip',
            statut='valide',
            utilisateur=self.admin,
            matiere=matiere,
            date_validation=timezone.now(),
            valide_par=self.admin
        )

        Ressources.objects.create(
            titres_ressources='Pending',
            type_ressources='td',
            filiere='L1',
            url='ressources/test2.zip',
            statut='en_attente',
            utilisateur=student,
            matiere=matiere
        )

        # Create document stage
        DocumentStage.objects.create(
            titre='Convention',
            type_document='convention',
            url_document='documents/test.pdf',
            est_modele_officiel=False,
            etudiant=student_profile
        )

    def test_get_stats(self):
        """Test admin statistics"""
        response = self.client.get(reverse('get_stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        stats = response.data['data']
        self.assertEqual(stats['total_etudiants'], 1)
        self.assertEqual(stats['total_filieres'], 1)
        self.assertEqual(stats['total_matieres'], 1)
        self.assertEqual(stats['total_ressources'], 2)
        self.assertEqual(stats['ressources_en_attente'], 1)
        self.assertEqual(stats['ressources_validees'], 1)
        self.assertEqual(stats['ressources_refusees'], 0)
        self.assertEqual(stats['total_documents'], 1)
        self.assertEqual(stats['ressources_par_type']['cours'], 1)
        self.assertEqual(stats['ressources_par_type']['td'], 1)