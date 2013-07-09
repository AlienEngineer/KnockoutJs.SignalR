using System.Collections.Generic;
using System.Linq;
using MvcSample.Controllers;

namespace MvcSample.Hubs
{
    public class TaskListViewModel : SynchronizerHub<Task>
    {
        private readonly TasksController tasks = new TasksController();

        public void FieldChanged(int id, string fieldName, string value)
        {
            // Does something in the server side.
            tasks.Put(id, value);

            // Use signalR to sinchronize the remaining clients.
            Clients
                .AllExcept(Context.ConnectionId)
                .fieldChanged(id, fieldName, value);
        }

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

    }
}