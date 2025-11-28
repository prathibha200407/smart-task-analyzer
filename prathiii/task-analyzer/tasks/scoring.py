from datetime import date

def calculate_score(task, all_tasks):
    """
    Returns an integer score for the given task.
    Higher score = higher priority.
    Factors: urgency, importance, effort, dependencies
    """

    # Urgency: days until due date
    days_remaining = (task.due_date - date.today()).days
    if days_remaining < 0:
        urgency_score = 0  # Past due, lowest urgency
    elif days_remaining == 0:
        urgency_score = 10  # Due today, highest urgency
    else:
        urgency_score = max(1, 10 - days_remaining)

    # Importance (1–10)
    importance_score = task.importance

    # Effort: Encourage low effort tasks (quick wins)
    if task.estimated_hours is None or task.estimated_hours <= 0:
        effort_score = 0  # Treat invalid/missing effort as lowest priority
    elif task.estimated_hours < 2:
        effort_score = 5  # Very quick win
    elif task.estimated_hours < 5:
        effort_score = 3
    else:
        effort_score = 1

    # Dependency: Tasks that block other tasks get a score boost
    blocks_count = sum([task.id in [dep.id for dep in t.dependencies.all()] for t in all_tasks if t.id != task.id])
    dependency_score = 2 * blocks_count

    # Final score: weighted sum
    score = (importance_score * 2) + urgency_score + effort_score + dependency_score

    return score
