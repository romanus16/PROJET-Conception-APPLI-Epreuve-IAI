# api/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Utilisateur, Filiere, Etudiant, Matiere, Ressources, DocumentStage
from .serializers import (
    RegisterSerializer,
    UtilisateurSerializer,
    FiliereSerializer,
    MatiereSerializer,
    RessourcesUploadSerializer,
    RessourcesSerializer,
    RessourcesValidationSerializer,
    DocumentStageUploadSerializer,
    DocumentStageSerializer,
    EtudiantSerializer,
)
from .permissions import IsAdminUser, CanViewRessource



# 1. AUTHENTIFICATION

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        utilisateur = serializer.save()
        refresh = RefreshToken.for_user(utilisateur)
        
        return Response({
            'success': True,
            'message': 'Inscription réussie',
            'data': {
                'user': UtilisateurSerializer(utilisateur).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        utilisateur = Utilisateur.objects.get(email=email)
        
        if utilisateur.check_password(password):
            refresh = RefreshToken.for_user(utilisateur)
            
            return Response({
                'success': True,
                'message': 'Connexion réussie',
                'data': {
                    'user': UtilisateurSerializer(utilisateur).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }
            })
        else:
            return Response({
                'success': False,
                'message': 'Email ou mot de passe incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Utilisateur.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Email ou mot de passe incorrect'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UtilisateurSerializer(request.user)
    data = serializer.data
    
    if request.user.role == 'etudiant':
        try:
            etudiant = Etudiant.objects.get(utilisateur=request.user)
            data['etudiant'] = EtudiantSerializer(etudiant).data
        except Etudiant.DoesNotExist:
            pass
    
    return Response({'success': True, 'data': data})


# 2. FILIERES

@api_view(['GET'])
@permission_classes([AllowAny])
def get_filieres(request):
    filieres = Filiere.objects.annotate(
        nombre_etudiants=Count('etudiants'),
        nombre_matieres=Count('matieres')
    )
    serializer = FiliereSerializer(filieres, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_filiere(request):
    serializer = FiliereSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Filière créée avec succès',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 3. MATIERES

@api_view(['GET'])
@permission_classes([AllowAny])
def get_matieres(request):
    queryset = Matiere.objects.annotate(nombre_ressources=Count('ressources'))
    
    filiere_id = request.query_params.get('filiere')
    if filiere_id:
        queryset = queryset.filter(filiere_id=filiere_id)
        
    niveau = request.query_params.get('niveau')
    if niveau:
        queryset = queryset.filter(niveau=niveau)
    
    serializer = MatiereSerializer(queryset, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_matiere(request):
    serializer = MatiereSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Matière créée avec succès',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 4. RESSOURCES AVEC VALIDATION

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_ressource(request):
    """
    Upload une ressource (ZIP)
    - Étudiant: ressource en attente de validation
    - Admin: ressource directement validée
    """
    
    serializer = RessourcesUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Déterminer le statut initial
    is_admin = request.user.role == 'admin'
    ressource = serializer.save(
        utilisateur=request.user,
        statut='valide' if is_admin else 'en_attente',
        date_validation=timezone.now() if is_admin else None,
        valide_par=request.user if is_admin else None,
    )
    message = "Ressource uploadée avec succès" if is_admin else "Ressource envoyée pour validation"

    return Response({
        'success': True,
        'message': message,
        'data': RessourcesSerializer(ressource).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ressources(request):
    """
    Liste des ressources accessibles:
    - Admin: voit toutes les ressources
    - Étudiant: voit seulement les ressources validées
    """
    queryset = Ressources.objects.select_related('matiere', 'utilisateur')
    
    matiere_id = request.query_params.get('matiere')
    if matiere_id:
        queryset = queryset.filter(matiere_id=matiere_id)
    
    type_ressource = request.query_params.get('type')
    if type_ressource:
        queryset = queryset.filter(type_ressources=type_ressource)
    
    if request.user.role != 'admin':
        queryset = queryset.filter(statut='valide')
    
    serializer = RessourcesSerializer(queryset, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_ressources_en_attente(request):
    """Liste des ressources en attente de validation (admin seulement)"""
    queryset = Ressources.objects.filter(statut='en_attente').select_related('matiere', 'utilisateur')
    serializer = RessourcesSerializer(queryset, many=True)
    return Response({
        'success': True,
        'count': queryset.count(),
        'data': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mes_ressources(request):
    """Voir mes propres ressources (tous statuts)"""
    queryset = Ressources.objects.filter(utilisateur=request.user).select_related('matiere')
    serializer = RessourcesSerializer(queryset, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def valider_ressource(request, pk):
    """
    Valider ou refuser une ressource (admin seulement)
    Envoie une notification email automatiquement
    """
    ressource = get_object_or_404(Ressources, pk=pk)
    
    serializer = RessourcesValidationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    
    if action == 'valider':
        ressource.valider(request.user)
        message = "Ressource validée avec succès. Un email a été envoyé à l'auteur."
    else:
        commentaire = serializer.validated_data.get('commentaire', '')
        ressource.refuser(request.user, commentaire)
        message = "Ressource refusée. Un email a été envoyé à l'auteur."
    
    return Response({
        'success': True,
        'message': message,
        'data': RessourcesSerializer(ressource).data
    }, status=status.HTTP_200_OK)


# 5. DOCUMENTS DE STAGE

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_documents_stage(request):
    queryset = DocumentStage.objects.select_related('etudiant')
    
    if request.user.role == 'etudiant':
        try:
            etudiant = Etudiant.objects.get(utilisateur=request.user)
            queryset = queryset.filter(etudiant=etudiant)
        except Etudiant.DoesNotExist:
            queryset = queryset.none()
    
    serializer = DocumentStageSerializer(queryset, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document_stage(request):
    serializer = DocumentStageUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    etudiant = serializer.validated_data['etudiant']
    
    # Sécurité : un étudiant ne peut pas uploader pour un autre
    if request.user.role == 'etudiant':
        try:
            if etudiant.utilisateur != request.user:
                return Response({'success': False, 'message': 'Action non autorisée'}, status=403)
        except Exception:
             return Response({'success': False, 'message': 'Profil invalide'}, status=400)

    document = serializer.save()
    
    return Response({
        'success': True,
        'message': 'Document uploadé avec succès',
        'data': DocumentStageSerializer(document).data
    }, status=status.HTTP_201_CREATED)


# 6. STATISTIQUES

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_stats(request):
    stats = {
        'total_etudiants': Etudiant.objects.count(),
        'total_filieres': Filiere.objects.count(),
        'total_matieres': Matiere.objects.count(),
        'total_ressources': Ressources.objects.count(),
        'ressources_en_attente': Ressources.objects.filter(statut='en_attente').count(),
        'ressources_validees': Ressources.objects.filter(statut='valide').count(),
        'ressources_refusees': Ressources.objects.filter(statut='refuse').count(),
        'total_documents': DocumentStage.objects.count(),
        'ressources_par_type': {},
    }
    
    for type_choice in Ressources.TYPE_CHOICES:
        stats['ressources_par_type'][type_choice[0]] = Ressources.objects.filter(
            type_ressources=type_choice[0]
        ).count()
    
    return Response({'success': True, 'data': stats})