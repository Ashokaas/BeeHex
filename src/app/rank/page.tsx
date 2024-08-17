import BeautifulButton from '@/components/button/button';
import Title_h1 from '@/components/Title_h1/title_h1';

import styles from './rank.module.css';
import axios from 'axios';

export default async function Home() {
	const response = await axios.get('http://192.168.1.28:3001/get_all_users');
	return (
		<>
			<div className={styles.rank_container}>
				<Title_h1 title="Classement" icon="leaderboard" />
				<table>
					<thead>
						<tr>
							<th>Position</th>
							<th>Username</th>
							<th>MMR</th>
						</tr>
					</thead>
					<tbody>
						{response.data.map((user: { username: string; mmr: number }, index: number) => (
							<tr key={index}>
								<td>{index + 1}</td>
								<td>{user.username}</td>
								<td>{user.mmr}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
