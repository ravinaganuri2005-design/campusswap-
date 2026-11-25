from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'platform': 'CampusSwap REST API',
        'tagline': 'Buy. Sell. Swap. Save.',
        'status': 'Online & Operational',
        'frontend_url': 'http://localhost:5173/',
        'documentation': {
            'products': '/api/products/',
            'favorites': '/api/favorites/',
            'messaging': '/api/messages/',
            'price_suggestion': '/api/price-suggestion/',
            'accounts': '/api/accounts/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('marketplace.urls')),
    path('api/messages/', include('messaging.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
