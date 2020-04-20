export class Client
{
	public id: string;

	public room: string;

	public host: boolean;

	public x: number;

	public y: number;

	constructor(connection: any, room: string)
	{
		this.id = connection.id;
		this.room = room;
	}

	public serialize(): object
	{
		return {
			"id": this.id,
			"room": this.room,
			"host": this.host,
			"x": this.x,
			"y": this.y
		};
	}

	public deserialize(data)
	{
		this.id = data.id;
		this.room = data.room;
		this.host = data.host;
		this.x = data.x;
		this.y = data.y;
	}
}