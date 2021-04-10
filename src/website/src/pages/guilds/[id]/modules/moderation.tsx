import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Heading } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildModerationSettings = dynamic(() => import('~/components/GuildModerationSettings'));

import { useUserStore } from '~/store/index';

const GuildModulesModerationPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (user.loggedIn === false) {
			void router.push('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user.loggedIn]);

	return (
		<GuildLayout>
			<Box my={{ base: 12 }} px={{ base: 50, xl: 150 }}>
				<Heading mb={8} size="md">
					Moderation Settings
				</Heading>
				<GuildModerationSettings />
			</Box>
		</GuildLayout>
	);
};

export default GuildModulesModerationPage;
