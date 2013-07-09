using System.Collections.Generic;
using Microsoft.AspNet.SignalR;

namespace MvcSample.Hubs
{
    /// <summary>
    /// Base type to implement a knockoutJs Sincronizer
    /// </summary>
    /// <typeparam name="TEntity">The type of the entity.</typeparam>
    public abstract class SynchronizerHub<TEntity> : Hub
    {

        /// <summary>
        /// Broadcasts a remote method call with every client except the caller.
        /// </summary>
        /// <returns></returns>
        protected dynamic Broadcast()
        {
            return Clients.AllExcept(Context.ConnectionId);
        }

        public abstract IEnumerable<TEntity> GetAll();

        public TEntity Add(TEntity entity)
        {
            var result = OnAdd(entity);

            Broadcast().push(entity);

            return result;
        }

        public void Remove(TEntity entity)
        {
            OnRemove(entity);
            Broadcast().destroy(entity);
        }

        /// <summary>
        /// Called when [remove].
        /// </summary>
        /// <param name="entity">The entity.</param>
        protected abstract void OnRemove(TEntity entity);

        /// <summary>
        /// Called when [add].
        /// </summary>
        /// <param name="entity">The entity.</param>
        /// <returns></returns>
        protected abstract TEntity OnAdd(TEntity entity);
    }
}