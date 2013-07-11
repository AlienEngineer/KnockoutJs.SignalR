using System.Collections.Generic;
using System.Linq;
using KnockoutJs.SignalR;
using MvcSample.Controllers;

namespace MvcSample.Hubs
{
    public class TaskListViewModel : SynchronizerHub<Task>
    {
        private readonly TasksController tasks = new TasksController();

        public override IEnumerable<Task> GetAll()
        {
            return tasks.Get().OrderBy(e => e.Id);
        }

        protected override void OnRemove(Task entity)
        {
            tasks.Delete(entity.Id);
        }

        protected override Task OnAdd(Task entity)
        {
            return tasks.Post(entity);
        }

        protected override Task OnUpdate(Task entity, string fieldName)
        {
            if (fieldName != "Title")
            {
                return entity;
            }

            tasks.Put(entity.Id, entity.Title);
            return entity;
        }
    }
}