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

        public void Add(Task task)
        {
            // Does something in the server side.
            tasks.Post(task);

            // Use signalR to sinchronize the remaining clients.
            Clients
                .AllExcept(Context.ConnectionId)
                .push(task);
        }
    }
}