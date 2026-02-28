from sqlalchemy.orm import Session
from app.models.task import Task

class EnergyService:
    
    @staticmethod
    def get_tasks_by_energy(db: Session, user_id: str, energy_level: str) -> list:
        """Get tasks sorted by energy match."""
        all_tasks = db.query(Task).filter(
            Task.user_id == user_id,
            Task.is_active == True
        ).all()
        
        # Sort: matching energy first, then adjacent, then opposite
        energy_order = {"low": 0, "medium": 1, "high": 2}
        user_energy = energy_order.get(energy_level, 1)
        
        def sort_key(task):
            task_energy = energy_order.get(task.energy_level, 1)
            return abs(user_energy - task_energy)
        
        return sorted(all_tasks, key=sort_key)
