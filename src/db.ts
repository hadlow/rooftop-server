const redis = require("redis");

export class DB
{
	private client: any;

	constructor()
	{
		this.client = redis.createClient();

		this.client.on("error", function(error)
		{
			console.error(error);
		});
	}

	// Client
	public setClient(client: any, callback)
	{
		// Create client entry
		this.client.hmset("client." + client.id, client, callback);
	}

	public getClient(id: string, callback)
	{
		this.client.hgetall("client." + id, callback);
	}

	public getClients(clientIds, callback)
	{
		var clients = [];
		var remaining = clientIds.length;

		for(let client of clientIds)
		{
			((client) =>
			{
				this.client.hgetall('client.' + client, function(error, reply)
				{
					clients.push(reply);

					--remaining;

					if(remaining === 0)
						callback(clients);
				});
			})(client);
		}
	}

	public updateClientLocation(id, x, y, callback)
	{
		this.setClient({"id": id, "x": x, "y": y}, callback);
	}

	public updateClientGroup(id, group, callback)
	{
		this.setClient({"id": id, "group": group}, callback);
	}

	public removeClient(client: any)
	{
		// Remove client from room
		this.removeClientFromRoom(client.room, client.id);

		// Remove client from redis
		this.client.del("client." + client.id, () =>
		{

		});
	}

	// Room
	public setRoom(room: any, callback)
	{
		// Create client entry
		this.client.hmset("room." + room.id, room, callback);
	}

	public addClientToRoom(room: string, client: string, callback)
	{
		this.client.rpush("room.clients." + room, client, callback);
	}

	public removeClientFromRoom(room: string, client: string)
	{
		this.client.lrem('room.clients.' + room, 0, client, (error, data) =>
		{
			if(error)
				throw error;
		});
	}

	public roomExists(id: string, callback)
	{
		this.client.exists("room." + id, callback);
	}

	public getRoom(id: string, callback)
	{
		this.client.hgetall("room." + id, callback);
	}

	public getClientsForRoom(room: string, callback)
	{
		this.client.lrange("room.clients." + room, 0, -1, callback);
	}

	public removeRoom(room: any)
	{
		// Remove client from redis
		this.client.del("room." + room.id);
		this.client.del("room.clients." + room.id);
	}
}