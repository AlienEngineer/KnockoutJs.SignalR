using System.Collections.Generic;
using System.Web.Http;

namespace MvcSample.Controllers
{

    public class Task
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsDone { get; set; }
    }

    public class TasksController : ApiController
    {
        private static readonly IDictionary<int, Task> _tasks = new Dictionary<int, Task>();
        private static int lastId;

        static TasksController()
        {
            for (int i = 1; i <= 10; i++)
            {
                _tasks.Add(i,
                    new Task { Id = i, IsDone = i % 2 == 0, Title = "Task " + i }
                );
            }
        }

        // GET api/<controller>
        public IEnumerable<Task> Get()
        {
            return _tasks.Values;
        }

        // GET api/<controller>/5
        public Task Get(int id)
        {
            return _tasks[id];
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
            _tasks.Add(
                ++lastId,
                new Task { Id = lastId, IsDone = false, Title = value }
             );
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
            var task = _tasks[id];
            task.Title = value;
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
            _tasks.Remove(id);
        }
    }
}