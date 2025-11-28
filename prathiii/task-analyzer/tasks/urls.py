from django.urls import path
from .views import AnalyzeTasksAPIView, SuggestTasksAPIView

urlpatterns = [
    path('api/tasks/analyze/', AnalyzeTasksAPIView.as_view(), name='analyze-tasks'),
    path('api/tasks/suggest/', SuggestTasksAPIView.as_view(), name='suggest-tasks'),
]
