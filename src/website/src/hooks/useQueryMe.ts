import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLMe } from '~/interfaces/User';

export function useQueryMe() {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLMe & { errors: unknown[] }>('user', () =>
		fetchGraphQL(
			`query Me {
				me: users {
					connections {
						id
						avatar
					}
					guild_moderators {
						guild_id
						manage
					}
					username
				}
			}`,
			{},
		).then(({ body }) => body),
	);

	useEffect(() => {
		if (data?.errors && data.errors.length) {
			if (user.loggedIn === null) {
				user.logout();
			}

			return;
		}

		if (user.loggedIn === null && data?.data?.me[0] && data.data?.me[0].connections.length) {
			const connection = data.data.me[0].connections[0]!;
			user.setUser({
				loggedIn: true,
				id: connection.id,
				username: data.data.me[0].username,
				avatar: connection.avatar,
				guilds: data.data.me[0].guild_moderators,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.errors, data?.data?.me]);

	return { data: data?.data, isLoading };
}
