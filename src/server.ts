import * as Helper from './helpers';
import { DB } from './db';

export class Server
{
	private db: DB;

	private io: any;

	constructor(io)
	{
		this.io = io;
		this.db = new DB();

		this.io.on('connection', (socket) =>
		{
			console.log("Joinging: " + socket.id);

			this.create(socket);

			this.join(socket);

			this.move(socket);

			this.leave(socket);
		});
	}

	private create(socket)
	{
		socket.on('create', (data) =>
		{
			let room = {
				id: Helper.roomId(),
				password: "",
				background: "",
				host: socket.id
			};

			let client = {
				id: socket.id,
				room: room.id,
				x: 0,
				y: 0
			};

			this.db.setClient(client, () =>
			{
				this.db.setRoom(room, () =>
				{
					this.db.addClientToRoom(room.id, client.id, () =>
					{

					});
				});
			});

			socket.emit('created', client);

			// Join room
			socket.join(room.id);
		});
	}

	private join(socket)
	{
		socket.on('join', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				this.db.getRoom(data.room, (error, room) =>
				{
					let mirror = {
						id: socket.id,
						room: room.id,
						x: 0,
						y: 0
					};
		
					this.db.setClient(mirror, () =>
					{
						this.db.addClientToRoom(room.id, mirror.id, () =>
						{

						});
					});

					this.db.getClientsForRoom(room.id, (error, clientIds) =>
					{
						//console.log("client ids: ");
						//console.log(clientIds);

						this.db.getClients(clientIds, (clients) =>
						{
							//console.log("clients: ");
							//console.log(clients);
							socket.emit('joined', {"mirror": mirror, "clients": clients});
						});

						// Let everyone in that room know they've joined
						this.io.to(room.id).emit('new', mirror);
					});
				});

				// Join room
				socket.join(data.room);
			});
		});
	}

	private leave(socket)
	{
		socket.on('disconnect', () =>
		{
			// Get client
			this.db.getClient(socket.id, (error, client) =>
			{
				if(client)
				{
					// Get room of client
					this.db.getRoom(client.room, (error, room) =>
					{
						// Let everyone in that room know they've left
						this.io.to(room.id).emit('leave', client.id);
						
						// If client is room host
						if(room.host == client.id)
						{
							// Remove room
							//this.db.removeRoom(room);
						}

						// Remove client from redis
						this.db.removeClient(client);
					});
				}
			});
		});
	}

	private move(socket)
	{
		/*
		socket.on('move', (data) =>
		{
			if(!(data.room in this.rooms))
			{
				socket.emit('error', "Room not found");

				return;
			}

			let room = this.rooms[data.room];

			room.updateClientLocation(data.client, data.location[0], data.location[1]);

			// Let everyone in that room know they've moved
			for(let client of room.getClients())
			{
				if(client.getId() == data.client)
					break;
				
				client.getConnection().emit('moved', {"id": client.getId(), "location": [data.location[0], data.location[1]]});
			}
		});
		*/
	}
}