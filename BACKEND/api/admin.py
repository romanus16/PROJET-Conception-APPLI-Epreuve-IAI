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
admin.site.register(Ressources)
admin.site.register(DocumentStage)

# Customize admin title
admin.site.site_header = "IAI TOGO Admin"
admin.site.site_title = "IAI TOGO Admin Portal"
admin.site.index_title = "Welcome to IAI TOGO Admin"

