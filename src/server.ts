import * as Helper from './helpers';
import { DB } from './db';
import { colors, randomColor } from './colors';

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
			this.create(socket);

			this.join(socket);

			this.move(socket);

			this.group(socket);

			this.message(socket);

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
				group: "",
				x: 200,
				y: 200
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
						group: "",
						x: Math.floor(Math.random() * Math.floor(600)),
						y: Math.floor(Math.random() * Math.floor(600))
					};
		
					this.db.setClient(mirror, () =>
					{
						this.db.addClientToRoom(room.id, mirror.id, () =>
						{
							this.db.getClientsForRoom(room.id, (error, clientIds) =>
							{
								this.db.getClients(clientIds, (clients) =>
								{
									socket.emit('joined', {"mirror": mirror, "clients": clients});
								});
		
								// Let everyone in that room know they've joined
								this.io.to(room.id).emit('new', mirror);
							});
						});
					});
				});

				// Join room
				socket.join(data.room);
			});
		});
	}

	private move(socket)
	{
		socket.on('move', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				/*
				this.db.getRoom(data.room, (error, room) =>
				{

				});
				*/

				this.db.updateClientLocation(data.client, data.location[0], data.location[1], () =>
				{
					// Let everyone in that room know they've moved
					this.io.to(data.room).emit('moved', {"id": data.client, "location": [data.location[0], data.location[1]]});
				});
			});
		});
	}

	private group(socket)
	{
		socket.on('group.create', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				let group = {"id": Helper.guid(), "color": randomColor()};

				this.db.updateClientGroup(data.client, JSON.stringify(group), () =>
				{
					// Let everyone in that room know they've moved
					this.io.to(data.room).emit('grouped', {"client": data.client, "group": group});
				});

				this.db.updateClientGroup(data.joining, JSON.stringify(group), () =>
				{
					// Let everyone in that room know they've moved
					this.io.to(data.room).emit('grouped', {"client": data.joining, "group": group});
				});
			});
		});

		socket.on('group.join', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				this.db.updateClientGroup(data.client, JSON.stringify(data.group), () =>
				{
					// Let everyone in that room know they've moved
					this.io.to(data.room).emit('grouped', {"client": data.client, "group": data.group});
				});
			});
		});

		socket.on('group.leave', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				this.db.updateClientGroup(data.client, '', () =>
				{
					// Let everyone in that room know they've moved
					this.io.to(data.room).emit('degrouped', {"client": data.client});
				});
			});
		});
	}

	private message(socket)
	{
		socket.on('message', (data) =>
		{
			// If room doesn't exist then let the client know
			this.db.roomExists(data.room, (error, roomExists) =>
			{
				if(!roomExists)
					return socket.emit('error', "Room not found");

				this.io.to(data.room).emit('message', {"id": data.client, "message": data.message});
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
}