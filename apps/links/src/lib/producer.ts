import { CompressionTypes, Kafka, type Producer } from "kafkajs";

function stringifyEvent(event: unknown): string {
	return JSON.stringify(event, (_key, value) =>
		value === undefined ? null : value
	);
}

interface ProducerConfig {
	broker?: string;
	username?: string;
	password?: string;
}

class LinksProducer {
	private producer: Producer | null = null;
	private connected = false;
	private readonly config: ProducerConfig;

	constructor(config: ProducerConfig) {
		this.config = config;
	}

	private async connect(): Promise<boolean> {
		if (this.connected && this.producer) {
			return true;
		}

		if (!this.config.broker) {
			return false;
		}

		try {
			const kafka = new Kafka({
				brokers: [this.config.broker],
				clientId: "links-producer",
				...(this.config.username &&
					this.config.password && {
					sasl: {
						mechanism: "scram-sha-256",
						username: this.config.username,
						password: this.config.password,
					},
					ssl: false,
				}),
			});

			this.producer = kafka.producer({
				maxInFlightRequests: 1,
				idempotent: true,
				transactionTimeout: 30_000,
			});

			await this.producer.connect();
			this.connected = true;
			return true;
		} catch (error) {
			console.error("Failed to connect to Kafka:", error);
			this.connected = false;
			return false;
		}
	}

	async send(topic: string, event: unknown, key?: string): Promise<void> {
		try {
			if (!((await this.connect()) && this.producer)) {
				return;
			}

			await this.producer.send({
				topic,
				messages: [
					{
						value: stringifyEvent(event),
						key: key || (event as { link_id?: string }).link_id,
					},
				],
				compression: CompressionTypes.GZIP,
			});
		} catch (error) {
			console.error("Failed to send to Kafka:", error);
		}
	}

	async disconnect(): Promise<void> {
		if (this.producer) {
			try {
				await this.producer.disconnect();
			} catch (error) {
				console.error("Failed to disconnect from Kafka:", error);
			}
			this.producer = null;
			this.connected = false;
		}
	}
}

const defaultConfig: ProducerConfig = {
	broker: process.env.REDPANDA_BROKER,
	username: process.env.REDPANDA_USER,
	password: process.env.REDPANDA_PASSWORD,
};

let defaultProducer: LinksProducer | null = null;

function getDefaultProducer(): LinksProducer {
	if (!defaultProducer) {
		defaultProducer = new LinksProducer(defaultConfig);
	}
	return defaultProducer;
}

export const sendLinkVisit = (event: unknown, key?: string): Promise<void> =>
	getDefaultProducer().send("analytics-link-visits", event, key);

export const disconnectProducer = async (): Promise<void> => {
	if (defaultProducer) {
		await defaultProducer.disconnect();
	}
};
