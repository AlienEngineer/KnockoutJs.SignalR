using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.SignalR;
using MvcSample.Controllers;

namespace MvcSample.Hubs
{
    public class TaskListViewModel : Hub
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

        public IEnumerable<Task> GetAll()
        {
            return tasks.Get().OrderBy(e => e.Id);
        }

        public Task Add(Task task)
        {
            // Does something in the server side.
            task = tasks.Post(task); 

            // Use signalR to sinchronize the remaining clients.
            Clients
                .AllExcept(Context.ConnectionId)
                .push(task);

            return task;
        }

        public void Remove(Task task)
        {
            // Does something in the server side.
            tasks.Delete(task.Id);

            // Use signalR to sinchronize the remaining clients.
            Clients
                .AllExcept(Context.ConnectionId)
                .destroy(task);
        }
    }
}