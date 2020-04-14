import * as Helper from './helpers';

export class Client
{
	private id: string;

	private connection: any;

	private host: boolean;

	constructor(connection)
	{
		this.id = Helper.guid();

		this.connection = connection;
	}

	public getId(): string
	{
		return this.id;
	}

	public getConnection()
	{
		return this.connection;
	}

	public setHost(host: boolean)
	{
		this.host = host;
	}

	public isHost(): boolean
	{
		return this.host;
	}
}