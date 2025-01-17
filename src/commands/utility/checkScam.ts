import type { BaseCommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { CheckScamCommand } from '../../interactions';
import { kRedis } from '../../tokens';
import { checkScam } from '../../functions/anti-scam/checkScam';
import { addFields, truncateEmbed } from '../../util/embed';
import type { APIEmbed } from 'discord-api-types';
import { checkModRole } from '../../functions/permissions/checkModRole';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction,
		args: ArgumentsOf<typeof CheckScamCommand>,
		locale: string,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);

		await interaction.deferReply({ ephemeral: args.hide ?? true });
		await checkModRole(interaction, locale);

		const domains = await checkScam(args.content);
		const cardinality = await redis.scard('scamdomains');
		const lastRefresh = await redis.get('scamdomains:refresh');

		const debugParts = [
			i18next.t('command.utility.check_scam.debug.domains', { lng: locale, count: cardinality }),
			i18next.t('command.utility.check_scam.debug.last_update', {
				lng: locale,
				refresh: lastRefresh
					? `<t:${Math.floor(parseInt(lastRefresh, 10) / 1000)}:f> (<t:${Math.floor(
							parseInt(lastRefresh, 10) / 1000,
					  )}:R>)`
					: i18next.t('command.utility.check_scam.debug.refresh_never', { lng: locale }),
			}),
		];

		let embed: APIEmbed = {
			color: domains.length ? 16462404 : 3908957,
			description: args.content,
		};

		embed = addFields(embed, {
			name: i18next.t('command.utility.check_scam.debug.title', { lng: locale }),
			value: debugParts.join('\n'),
		});

		if (domains.length) {
			embed = addFields(embed, {
				name: i18next.t('command.utility.check_scam.found', { lng: locale, count: domains.length }),
				value: domains.map((domain) => `• \`${domain}\``).join('\n'),
			});
		}

		await interaction.editReply({ embeds: [truncateEmbed(embed)] });
	}
}
