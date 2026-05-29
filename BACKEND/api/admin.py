from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage

class UtilisateurAdmin(UserAdmin):
    model = Utilisateur
    list_display = ['email', 'nom', 'prenom', 'role', 'is_staff', 'is_admin']
    list_filter = ['role', 'is_staff', 'is_admin']
    fieldsets = UserAdmin.fieldsets + (
        ('Info Utilisateur', {'fields': ('nom', 'prenom', 'role')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Info Utilisateur', {'fields': ('nom', 'prenom', 'role')}),
    )
    search_fields = ['email', 'nom', 'prenom']
    ordering = ['email']

admin.site.register(Utilisateur, UtilisateurAdmin)
admin.site.register(Filiere)
admin.site.register(Etudiant)
admin.site.register(Matiere)

@admin.register(Ressources)
class RessourcesAdmin(admin.ModelAdmin):
    list_display = ['titres_ressources', 'type_ressources', 'filiere', 'matiere', 'statut', 'utilisateur', 'date_soumission']
    list_filter = ['type_ressources', 'filiere', 'statut', 'date_soumission']
    search_fields = ['titres_ressources', 'description', 'utilisateur__nom', 'utilisateur__prenom']
    readonly_fields = ['date_soumission', 'date_validation', 'valide_par', 'commentaire_refus', 'nombre_telechargements']
    ordering = ['-date_soumission']

admin.site.register(DocumentStage)

# Customize admin title
admin.site.site_header = "IAI TOGO Admin"
admin.site.site_title = "IAI TOGO Admin Portal"
admin.site.index_title = "Welcome to IAI TOGO Admin"

