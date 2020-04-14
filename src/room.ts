import * as Helper from './helpers';
import { Client } from 'client';

export class Room
{
	private id: string;

	private clients: Client[] = [];

	constructor()
	{
		this.id = Helper.roomId();
	}

	public getId(): string
	{
		return this.id;
	}

	public addClient(client: Client)
	{
		this.clients.push(client);
	}

	public getClients(): Client[]
	{
		return this.clients;
	}

	public serializeClients(): object[]
	{
		let clients: object[] = [];

		for(let client of this.clients)
		{
			let clientString = {
				"id": client.getId()
			};

			clients.push(clientString);
		}

		return clients;
	}
}