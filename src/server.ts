import { Client } from './client';
import { Room } from './room';

export class Server
{
	private rooms: object = {};

	constructor(io)
	{
		io.on('connection', (socket) =>
		{
			console.log('client connected: ' + socket.id);
			this.create(socket);

			this.join(socket);

			// Disconnect the socket
			socket.on('disconnect', () =>
			{
				
			});
		});
	}

	private create(socket)
	{
		socket.on('create', (data) =>
		{
			let client = new Client(socket);
			let room = new Room();

			room.addClient(client);
			
			this.rooms[room.getId()] = room;
			
			let payload = {
				"client": client.getId(),
				"room": room.getId()
			};
			
			socket.emit('created.success', payload);
		});
	}

	private join(socket)
	{
		socket.on('join', (data) =>
		{
			let client = new Client(socket);

			if(!(data.room in this.rooms))
			{
				socket.emit('joined.error', "Room not found");

				return;
			}

			let room = this.rooms[data.room];

			room.addClient(client);

			let payload = {
				"id": client.getId(),
				"room": room.getId(),
				"clients": room.serializeClients()
			};

			socket.emit('joined.success', payload);

			// Let everyone in that room know they've joined
			for(let otherClient of room.getClients())
			{
				if(otherClient.getId() == client.getId())
					break;
				
				otherClient.getConnection().emit('new', {"id": client.getId()});
			}
		});
	}
}