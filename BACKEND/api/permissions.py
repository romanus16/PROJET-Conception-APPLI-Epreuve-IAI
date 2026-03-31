# api/permissions.py
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Seul l'admin a accès"""
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class CanViewRessource(permissions.BasePermission):
    """
    Permission pour voir une ressource:
    - Admin: voit toutes les ressources
    - Étudiant: voit seulement les ressources validées
    - Auteur: voit ses propres ressources (même en attente)
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        if obj.utilisateur == request.user:
            return True
        
        return obj.statut == 'valide'