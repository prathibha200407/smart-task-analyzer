from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer
from .scoring import calculate_score

from datetime import datetime  # ADD THIS IMPORT

class AnalyzeTasksAPIView(APIView):
    def post(self, request):
        tasks = request.data.get('tasks', [])
        all_tasks_queryset = Task.objects.all()
        results = []
        for t in tasks:
            # Try to load fields, handle missing/invalid data
            try:
                due_date_str = t.get('due_date')
                due_date_obj = datetime.strptime(due_date_str, "%Y-%m-%d").date() if due_date_str else None

                db_task = Task(
                    title=t.get('title', ''),
                    due_date=due_date_obj,
                    estimated_hours=t.get('estimated_hours', 0),
                    importance=t.get('importance', 1)
                )
                # dependencies can be handled if passed as ids
            except Exception as e:
                continue  # Skip invalid tasks

            score = calculate_score(db_task, all_tasks_queryset)
            t['score'] = score
            t['explanation'] = f"Score: {score} based on urgency, importance, effort, and dependencies."
            results.append(t)
        
        # Sort by score descending
        sorted_tasks = sorted(results, key=lambda x: x['score'], reverse=True)
        return Response(sorted_tasks)

class SuggestTasksAPIView(APIView):
    def get(self, request):
        all_tasks = Task.objects.all()
        results = []
        for task in all_tasks:
            score = calculate_score(task, all_tasks)
            results.append({
                'id': task.id,
                'title': task.title,
                'due_date': task.due_date,
                'estimated_hours': task.estimated_hours,
                'importance': task.importance,
                'score': score,
                'explanation': f"Score {score}: urgency={task.due_date}, importance={task.importance}, effort={task.estimated_hours}, dependencies={task.dependencies.count()}"
            })

        sorted_tasks = sorted(results, key=lambda x: x['score'], reverse=True)
        top3 = sorted_tasks[:3]
        return Response(top3)
