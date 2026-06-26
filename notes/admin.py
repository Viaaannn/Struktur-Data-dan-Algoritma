from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'updated_at')
    list_filter = ('user',)
    search_fields = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')
