# api/views.py
import json
import os
import requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage

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
    ChangePasswordSerializer,
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

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_filiere(request, pk):
    filiere = get_object_or_404(Filiere, pk=pk)
    serializer = FiliereSerializer(filiere, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Filière mise à jour avec succès',
            'data': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_filiere(request, pk):
    filiere = get_object_or_404(Filiere, pk=pk)
    filiere.delete()
    return Response({
        'success': True,
        'message': 'Filière supprimée avec succès'
    }, status=status.HTTP_204_NO_CONTENT)


# 3. MATIERES

@api_view(['GET'])
@permission_classes([AllowAny])
def get_matieres(request):
    queryset = Matiere.objects.annotate(nombre_ressources=Count('ressources'))
    
    filiere_id = request.query_params.get('filiere')
    if filiere_id:
        # Filtrer par niveau de matière pour correspondre à la logique frontend
        queryset = queryset.filter(niveau=filiere_id)
        
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

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_matiere(request, pk):
    matiere = get_object_or_404(Matiere, pk=pk)
    serializer = MatiereSerializer(matiere, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Matière mise à jour avec succès',
            'data': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_matiere(request, pk):
    matiere = get_object_or_404(Matiere, pk=pk)
    matiere.delete()
    return Response({
        'success': True,
        'message': 'Matière supprimée avec succès'
    }, status=status.HTTP_204_NO_CONTENT)


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
    
    # Si admin, envoyer notification immédiate
    if is_admin:
        ressource._envoyer_notification_validee()
    else:
        # Si étudiant, notifier les administrateurs
        ressource._envoyer_notification_upload_admin()
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

    # Filtres
    matiere_id = request.query_params.get('matiere')
    if matiere_id:
        queryset = queryset.filter(matiere_id=matiere_id)

    type_ressource = request.query_params.get('type')
    if type_ressource:
        queryset = queryset.filter(type_ressources=type_ressource)

    # Recherche
    search_query = request.query_params.get('search')
    if search_query:
        queryset = queryset.filter(
            models.Q(titres_ressources__icontains=search_query) |
            models.Q(matiere__nom_matiere__icontains=search_query) |
            models.Q(description__icontains=search_query) |
            models.Q(utilisateur__nom__icontains=search_query) |
            models.Q(utilisateur__prenom__icontains=search_query)
        )

    # Filtre par statut (pour admin seulement)
    statut = request.query_params.get('statut')
    if statut and request.user.role == 'admin':
        queryset = queryset.filter(statut=statut)

    # Filtre par filière
    filiere = request.query_params.get('filiere')
    if filiere:
        queryset = queryset.filter(filiere=filiere)

    if request.user.role != 'admin':
        queryset = queryset.filter(statut='valide')

    # Pagination
    page = request.query_params.get('page', 1)
    page_size = request.query_params.get('page_size', 20)
    try:
        page = int(page)
        page_size = int(page_size)
    except ValueError:
        page = 1
        page_size = 20

    paginator = Paginator(queryset, page_size)

    try:
        paginated_queryset = paginator.page(page)
    except EmptyPage:
        paginated_queryset = paginator.page(paginator.num_pages)

    serializer = RessourcesSerializer(paginated_queryset, many=True)

    return Response({
        'success': True,
        'data': serializer.data,
        'pagination': {
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'has_next': paginated_queryset.has_next(),
            'has_previous': paginated_queryset.has_previous()
        }
    })


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
    """
    Upload d'un document de stage (rapport, convention, attestation, etc.)
    """
    # Récupérer l'étudiant connecté
    try:
        etudiant = Etudiant.objects.get(utilisateur=request.user)
    except Etudiant.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Profil étudiant introuvable. Veuillez contacter un administrateur.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Préparer les données pour le serializer
    data = request.data.copy()
    data['etudiant'] = etudiant.id
    
    # Utiliser le serializer comme pour les ressources (qui fonctionne)
    serializer = DocumentStageUploadSerializer(data=data)
    
    if not serializer.is_valid():
        print(f"Erreurs de validation: {serializer.errors}")
        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Veuillez vérifier les données envoyées'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Sauvegarder le document
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

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_etudiants(request):
    etudiants = Etudiant.objects.select_related('utilisateur', 'filiere').all()
    return Response({'success': True, 'data': EtudiantSerializer(etudiants, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({
            'success': False,
            'message': 'Mot de passe actuel incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'success': True, 'message': 'Mot de passe modifié avec succès'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ressource_preview(request, pk):
    """
    Obtenir les informations de prévisualisation d'une ressource
    Retourne le type de fichier et l'URL pour affichage dans le navigateur
    """
    from django.http import FileResponse
    import os
    
    ressource = get_object_or_404(Ressources, pk=pk, statut='valide')
    
    # Vérifier les permissions
    if request.user.role != 'admin' and ressource.utilisateur != request.user:
        return Response({'success': False, 'message': 'Action non autorisée'}, status=403)
    
    if not ressource.url:
        return Response({'success': False, 'message': 'Fichier non disponible'}, status=404)
    
    # Obtenir l'extension du fichier
    file_path = ressource.url.path
    file_extension = os.path.splitext(file_path)[1].lower()
    
    # Types de fichiers visualisables
    previewable_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.html': 'text/html',
    }
    
    mime_type = previewable_types.get(file_extension)
    can_preview = mime_type is not None
    
    # Incrémenter le compteur de téléchargements
    ressource.nombre_telechargements += 1
    ressource.save(update_fields=['nombre_telechargements'])
    
    return Response({
        'success': True,
        'data': {
            'url': ressource.url.url,
            'filename': os.path.basename(file_path),
            'file_extension': file_extension,
            'mime_type': mime_type,
            'can_preview': can_preview,
            'titre': ressource.titres_ressources,
            'type': ressource.type_ressources,
        }
    })


# 7. ASSISTANT IA

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_ai(request):
    """
    Endpoint pour poser une question à l'assistant IA
    L'IA peut répondre à des questions sur les cours, les ressources, les stages, etc.
    """
    question = request.data.get('question', '').strip()
    context = request.data.get('context', '')
    
    if not question:
        return Response({
            'success': False,
            'message': 'La question est requise'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Récupérer la clé API Groq depuis les variables d'environnement
    api_key = os.getenv('GROQ_API_KEY')
    
    # Modèle IA à utiliser
    model = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
    
    # Construire le prompt système avec le contexte éducatif
    system_prompt = """Tu es un assistant pédagogique intelligent pour l'IAI Togo (Institut d'Administration et d'Informatique). 
Ton rôle est d'aider les étudiants et les administrateurs à trouver des informations sur :
- Les filières et matières disponibles
- Les ressources pédagogiques (cours, TD, examens)
- Les stages et documents associés
- Les procédures administratives

Tu dois répondre de manière claire, précise et pédagogique en français.
Si tu ne connais pas la réponse, dis-le honnêtement et suggère de contacter un administrateur.
"""
    
    # Ajouter le contexte si fourni
    user_message = question
    if context:
        user_message = f"Contexte : {context}\n\nQuestion : {question}"
    
    # Si pas de clé API, utiliser une réponse simulée
    if not api_key:
        print("GROQ_API_KEY non définie, utilisation du mode démonstration")
        ai_response = _generate_demo_response(question)
        return Response({
            'success': True,
            'data': {
                'question': question,
                'response': ai_response,
                'model': 'demo-mode'
            }
        })
    
    print(f"Appel IA avec Groq modèle: {model}")
    
    try:
        # Appel à l'API Groq
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ],
            'max_tokens': 1000,
            'temperature': 0.7
        }
        
        print("Envoi de la requête à Groq...")
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Réponse Groq: status={response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            ai_response = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            return Response({
                'success': True,
                'data': {
                    'question': question,
                    'response': ai_response,
                    'model': model
                }
            })
        elif response.status_code == 401:
            print("Clé API Groq invalide, utilisation du mode démonstration")
            ai_response = _generate_demo_response(question)
            return Response({
                'success': True,
                'data': {
                    'question': question,
                    'response': ai_response,
                    'model': 'demo-mode (API key invalide)'
                }
            })
        elif response.status_code == 402:
            return Response({
                'success': False,
                'message': 'Crédits API IA épuisés. Veuillez contacter l\'administrateur.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif response.status_code == 429:
            return Response({
                'success': False,
                'message': 'Trop de requêtes. Veuillez attendre quelques instants.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        else:
            error_msg = f"Erreur API IA: {response.status_code}"
            try:
                error_data = response.json()
                error_msg = error_data.get('error', {}).get('message', error_msg)
            except:
                pass
            
            print(f"Détails erreur: {error_msg}")
            
            return Response({
                'success': False,
                'message': f'Erreur de l\'assistant IA: {error_msg}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except requests.exceptions.Timeout:
        print("Timeout de la requête IA")
        return Response({
            'success': False,
            'message': 'Délai d\'attente dépassé. Veuillez réessayer.'
        }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        
    except requests.exceptions.ConnectionError as e:
        print(f"Erreur de connexion: {str(e)}")
        # Mode démonstration en cas d'erreur de connexion
        ai_response = _generate_demo_response(question)
        return Response({
            'success': True,
            'data': {
                'question': question,
                'response': ai_response,
                'model': 'demo-mode (connexion échouée)'
            }
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Erreur requête: {str(e)}")
        ai_response = _generate_demo_response(question)
        return Response({
            'success': True,
            'data': {
                'question': question,
                'response': ai_response,
                'model': 'demo-mode'
            }
        })
        
    except Exception as e:
        print(f"Erreur inattendue: {str(e)}")
        ai_response = _generate_demo_response(question)
        return Response({
            'success': True,
            'data': {
                'question': question,
                'response': ai_response,
                'model': 'demo-mode'
            }
        })


def _generate_demo_response(question):
    """
    Génère une réponse de démonstration lorsque l'API IA n'est pas disponible.
    """
    question_lower = question.lower()
    
    # Réponses prédéfinies basées sur les mots-clés
    if 'upload' in question_lower or 'télécharger' in question_lower or 'ressource' in question_lower:
        return """Pour uploader une ressource, suivez ces étapes :

1. Connectez-vous à votre compte étudiant
2. Allez dans la section "Upload" ou "Ressources"
3. Cliquez sur le bouton "+ Upload"
4. Remplissez les informations :
   - Titre de la ressource
   - Type (Cours, TD, TP, Examen, Autre)
   - Filière concernée
   - Matière associée
   - Fichier (format ZIP recommandé)
5. Cliquez sur "Soumettre"

Votre ressource sera examinée par un administrateur avant d'être publiée. Vous recevrez une notification par email une fois validée."""

    elif 'filière' in question_lower or 'filiere' in question_lower or 'disponible' in question_lower:
        return """L'IAI Togo propose plusieurs filières :

📚 **Licence 1 (L1)** - Tronc commun
   - Informatique générale
   - Mathématiques et informatique
   - Gestion et administration

📚 **Licence 2 (L2)** - Approfondissement
   - Informatique et gestion
   - Réseaux et systèmes

📚 **Licence 3 (L3)** - Spécialisation
   - **GLSI** (Génie Logiciel et Systèmes d'Information)
   - **ASR** (Architecture des Systèmes et Réseaux)

Pour plus de détails sur les matières de chaque filière, consultez la section "Cours" de la plateforme."""

    elif 'stage' in question_lower or 'rapport' in question_lower or 'validation' in question_lower:
        return """Pour valider un document de stage :

1. **Étudiant** :
   - Allez dans la section "Stages"
   - Cliquez sur "Déposer un document"
   - Sélectionnez le type (Convention, Rapport, Attestation, Autre)
   - Téléchargez votre fichier
   - Soumettez

2. **Administrateur** :
   - Allez dans "Admin > Validation"
   - Consultez les documents en attente
   - Validez ou refusez avec un commentaire
   - L'étudiant reçoit une notification

Les documents validés sont accessibles dans l'espace personnel de l'étudiant."""

    elif 'cours' in question_lower or 'matière' in question_lower or 'matiere' in question_lower:
        return """Pour accéder aux cours de votre filière :

1. Connectez-vous à votre compte
2. Allez dans la section "Cours"
3. Sélectionnez votre filière et votre niveau
4. Parcourez les matières disponibles
5. Cliquez sur une matière pour voir les ressources associées (cours, TD, TP, examens)

Les ressources sont classées par type et peuvent être téléchargées après validation par un administrateur."""

    elif 'inscription' in question_lower or 'inscrire' in question_lower:
        return """Pour vous inscrire sur la plateforme :

1. Cliquez sur "S'inscrire" sur la page de connexion
2. Remplissez le formulaire :
   - Nom, Prénom
   - Email (sera votre identifiant)
   - Mot de passe
   - Matricule (si vous l'avez, sinon un sera généré)
   - Niveau et filière
3. Validez l'inscription
4. Connectez-vous avec vos identifiants

Votre compte étudiant sera créé automatiquement."""

    elif 'bonjour' in question_lower or 'salut' in question_lower or 'cc' in question_lower:
        return """Bonjour ! 👋 Je suis l'assistant IA de l'IAI Togo.

Je suis là pour vous aider à naviguer sur la plateforme et répondre à vos questions sur :
- Les filières et matières
- Les ressources pédagogiques
- Les stages et documents
- Les procédures d'inscription

N'hésitez pas à me poser une question !"""

    else:
        return f"""Merci pour votre question : "{question}"

Je suis un assistant IA en mode démonstration. Pour obtenir une réponse précise, je vous recommande de :

1. Consulter la section "Cours" pour les ressources pédagogiques
2. Contacter l'administration de l'IAI Togo
3. Vérifier les FAQs disponibles sur la plateforme

Si vous avez des questions spécifiques sur les filières, les ressources, les stages ou les inscriptions, n'hésitez pas à me les poser !"""
