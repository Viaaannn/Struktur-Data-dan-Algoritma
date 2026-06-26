from django.urls import path
from . import views

app_name = 'notes'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    
    # Kategori / Folder (UBAH LINE DI BAWAH INI JADI create_category)
    path('category/new/', views.create_category, name='create_category'),
    path('category/<int:pk>/', views.category_detail, name='category_detail'),
    path('category/<int:pk>/edit/', views.edit_category, name='edit_category'),
    path('category/<int:pk>/delete/', views.delete_category, name='delete_category'),
    
    # Dokumen
    path('document/new/', views.new_document, name='new_document'),
    path('document/<int:pk>/', views.editor, name='editor'),
    path('document/<int:pk>/save/', views.save_document, name='save_document'),
    path('document/<int:pk>/rename/', views.rename_document, name='rename_document'),
    path('document/<int:pk>/delete/', views.delete_document, name='delete_document'),
    
    # Auth
    path('register/', views.register, name='register'),
]