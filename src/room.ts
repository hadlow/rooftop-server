import * as Helper from './helpers';
import { Client } from 'client';

export class Room
{
	public id: string;

	public password: string;

	public background: string;

	public host: string;

	//private clients: Client[] = [];

	constructor()
	{
		this.id = Helper.roomId();
	}

	public serialize(): object
	{
		return {
			"id": this.id,
			"password": this.password,
			"background": this.background,
			"host": this.host,
		};
	}

	/*
	public addClient(client: Client)
	{
		this.clients[client.getId()] = client;
	}

	public getClients(): Client[]
	{
		return this.clients;
	}

	public getClient(client: string): Client
	{
		return this.clients[client];
	}

	public serializeClients(): object[]
	{
		let clients: object[] = [];

		for(let clientId in this.clients)
		{
			var client = this.clients[clientId];

			let clientString = {
				"id": client.getId()
			};

			clients.push(clientString);
		}

		return clients;
	}

	public updateClientLocation(client: string, x: number, y: number)
	{
		this.getClient(client).setLocation(x, y);
	}
	*/
}