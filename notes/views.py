from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from .models import Category, Document

@login_required
def dashboard(request):
    categories = Category.objects.filter(user=request.user)
    recent_docs = Document.objects.filter(user=request.user).order_by('-updated_at')
    uncategorized_docs = Document.objects.filter(user=request.user, category=None)
    
    context = {
        'categories': categories,
        'recent_docs': recent_docs,
        'uncategorized_docs': uncategorized_docs,
    }
    return render(request, 'notes/dashboard.html', context)

@login_required
def category_detail(request, pk):
    category = get_object_or_404(Category, id=pk, user=request.user)
    documents = category.documents.all().order_by('-updated_at')
    categories = Category.objects.filter(user=request.user)
    uncategorized_docs = Document.objects.filter(user=request.user, category=None)
    
    context = {
        'category': category,
        'documents': documents,
        'categories': categories,
        'uncategorized_docs': uncategorized_docs,
    }
    return render(request, 'notes/category_detail.html', context)

@login_required
def new_document(request):
    categories = Category.objects.filter(user=request.user)
    category_id = request.GET.get('category_id') or request.POST.get('category_id')
    
    category = None
    if category_id:
        # PENGAMANAN BARU: Menggunakan filter agar tidak terjadi error 404 jika folder sudah dihapus
        category = Category.objects.filter(id=category_id, user=request.user).first()
        if not category:
            return redirect('notes:dashboard')
    
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        
        if title:
            document = Document.objects.create(
                title=title,
                category=category,
                user=request.user,
                content="" 
            )
            return redirect('notes:editor', pk=document.id)
        else:
            error_msg = "Judul dokumen tidak boleh kosong!"
            return render(request, 'notes/new_document.html', {
                'category': category, 
                'categories': categories, 
                'error': error_msg
            })
            
    return render(request, 'notes/new_document.html', {
        'category': category,
        'categories': categories
    })

@login_required
def rename_document(request, pk):
    if request.method == 'POST':
        doc = get_object_or_404(Document, id=pk, user=request.user)
        new_title = request.POST.get('title', '').strip()
        if new_title:
            doc.title = new_title
            doc.save()
        
        next_url = request.POST.get('next', 'notes:dashboard')
        return redirect(next_url)
    return redirect('notes:dashboard')

@login_required
def editor(request, pk):
    current_doc = get_object_or_404(Document, id=pk, user=request.user)
    categories = Category.objects.filter(user=request.user)
    uncategorized_docs = Document.objects.filter(user=request.user, category=None)
    
    context = {
        'current_doc': current_doc,
        'categories': categories,
        'uncategorized_docs': uncategorized_docs,
    }
    return render(request, 'notes/editor.html', context)

@login_required
def save_document(request, pk):
    if request.method == 'POST':
        doc = get_object_or_404(Document, id=pk, user=request.user)
        doc.content = request.POST.get('content', '')
        doc.title = request.POST.get('title', doc.title)
        doc.save()
    return redirect('notes:editor', pk=pk)

@login_required
def delete_document(request, pk):
    # PENGAMANAN: Pastikan dokumen milik user yang sedang login
    doc = get_object_or_404(Document, id=pk, user=request.user) 
    
    if request.method == 'POST':
        doc.delete()
        
    # Memaksa redirect ke dashboard agar tidak muncul error 404
    return redirect('notes:dashboard')

@login_required
def create_category(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            Category.objects.create(user=request.user, name=name)
    return redirect('notes:dashboard')

@login_required
def edit_category(request, pk):
    category = get_object_or_404(Category, id=pk, user=request.user)
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            category.name = name
            category.save()
    return redirect('notes:dashboard')

@login_required
def delete_category(request, pk):
    category = get_object_or_404(Category, id=pk, user=request.user)
    if request.method == 'POST':
        category.delete()
    return redirect('notes:dashboard')

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('notes:dashboard')
    else:
        form = UserCreationForm()
        
    return render(request, 'registration/register.html', {'form': form})