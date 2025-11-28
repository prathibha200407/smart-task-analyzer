from django.test import TestCase
from .models import Task
from .scoring import calculate_score

class ScoringTests(TestCase):
    def test_high_importance_low_effort(self):
        task = Task(importance=10, estimated_hours=2, due_date='2025-12-01')
        score = calculate_score(task, [])
        self.assertTrue(score > 15)  # Replace 15 with a suitable threshold

    def test_low_importance_high_effort(self):
        task = Task(importance=2, estimated_hours=10, due_date='2025-12-01')
        score = calculate_score(task, [])
        self.assertTrue(score < 10)  # Replace 10 with a suitable value

    def test_due_soon(self):
        task = Task(importance=5, estimated_hours=3, due_date='2025-11-28')
        score = calculate_score(task, [])
        self.assertTrue(score > 10)  # Replace 10 with a suitable value
