from django.core.management.base import BaseCommand
from api.models import Utilisateur, Filiere, Matiere, Ressources, Etudiant
from django.utils import timezone


class Command(BaseCommand):
    help = 'Ajoute des données de test'

    def handle(self, *args, **options):
        if Utilisateur.objects.exists():
            self.stdout.write('La base contient déjà des données, seed ignoré.')
            return

        admin = Utilisateur.objects.create_user(
            nom='Admin', prenom='Admin', email='admin@iai.tg',
            password='admin123', role='admin'
        )
        admin.is_staff = True
        admin.is_admin = True
        admin.is_superuser = True
        admin.save()

        etud = Utilisateur.objects.create_user(
            nom='Dupont', prenom='Jean', email='jean@iai.tg',
            password='etudiant123', role='etudiant'
        )
        Etudiant.objects.create(
            utilisateur=etud, matricule='IAI000001',
            niveau='L3_GLSI', annee_inscription=2024
        )

        filiere = Filiere.objects.create(
            libelle_fil='Génie Logiciel et Systèmes Informatiques',
            description='Formation en développement logiciel et administration systèmes'
        )
        Filiere.objects.create(
            libelle_fil='Administration des Systèmes et Réseaux',
            description='Formation en administration réseau et sécurité'
        )

        matiere = Matiere.objects.create(
            nom_matiere='Bases de Données',
            coef_ue='4', niveau='L3_GLSI',
            filiere=filiere, credits=4, semestre=1,
            description='Conception et administration de bases de données'
        )
        Matiere.objects.create(
            nom_matiere='Génie Logiciel',
            coef_ue='5', niveau='L3_GLSI',
            filiere=filiere, credits=5, semestre=1,
            description='Méthodologies de développement logiciel'
        )

        Ressources.objects.create(
            titres_ressources='Cours complet Bases de Données – SGBDR',
            type_ressources='cours', url='ressources/sample.txt',
            description='Support de cours complet sur les SGBDR, algèbre relationnelle et SQL.',
            statut='valide', utilisateur=admin, matiere=matiere,
            date_validation=timezone.now(), valide_par=admin,
            notification_envoyee=True,
        )
        Ressources.objects.create(
            titres_ressources='TD SQL – Requêtes avancées',
            type_ressources='td', url='ressources/sample.txt',
            description='Série d\'exercices sur les jointures, sous-requêtes et fonctions fenêtres.',
            statut='valide', utilisateur=admin, matiere=matiere,
            date_validation=timezone.now(), valide_par=admin,
            notification_envoyee=True,
        )

        self.stdout.write(self.style.SUCCESS('Données de test ajoutées avec succès !'))
        self.stdout.write(f'  Admin:     admin@iai.tg / admin123')
        self.stdout.write(f'  Étudiant:  jean@iai.tg / etudiant123')
