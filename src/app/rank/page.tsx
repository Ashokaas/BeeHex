"use client";
import BeautifulButton from '@/components/button/button';
import Title_h1 from '@/components/title_h1/title_h1';


import styles from './rank.module.css';
import axios from 'axios';

import { useEffect, useState } from 'react';

import getEnv from '@/env/env';

function mmr_to_rank(mmr: number) {
	if (mmr < 200) return 0
	if (mmr < 400) return 0
	if (mmr < 600) return 1
	if (mmr < 800) return 2
	if (mmr < 1000) return 3
	if (mmr < 1200) return 4
	if (mmr < 1400) return 5
	if (mmr < 1600) return 6
	if (mmr < 1800) return 7
	return 8
}

export default function Home() {
	const [first, setFirst] = useState(0);
	const [limit, setLimit] = useState(5);
	const [users, setUsers] = useState([]);
	const [total, setTotal] = useState(0);

	const fetchUsers = async (first: number, last: number) => {
		const response = await axios.get(`http://${getEnv()['IP_HOST']}:3001/get_all_users?first=${first}&limit=${limit}`);
		while (response.data.rows.length < 5) {
			response.data.rows.push({ username: "", mmr: "" });
		}
		console.log(response.data.rows.length);
		setUsers(response.data.rows);
		setTotal(response.data.total);

	};

	useEffect(() => {
		fetchUsers(first, limit);
	}, [first, limit]);

	const handleNext = () => {
		if (first + 5 < total) {
			setFirst(first + 5);
			fetchUsers(first, limit);
		};
	};

	const handlePrevious = () => {
		if (first > 0) {
			setFirst(first - 5);
			fetchUsers(first, limit);
		}
	}

	const reqSvgs = require.context('../../assets/ranked_icons', true, /\.svg$/)
	const paths = reqSvgs.keys()
	const svgs = paths.map(path => reqSvgs(path))
	console.log(svgs)
	const ranks = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800]



	return (
		<>
			<div className={styles.rank_container}>
				<div>
					<Title_h1 text="Classement" icon="leaderboard" />
				</div>
				<div className={styles.content}>
					<div className={styles.leaderboard_container}>
						<table>
							<thead>
								<tr>
									<th>Position</th>
									<th>Username</th>
									<th>MMR</th>
									<th>Rank</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user: { username: string; mmr: number }, index: number) => (
									<tr key={index}>
										<td>{first + index + 1}</td>
										<td>{user.username}</td>
										<td>{user.mmr}</td>
										<td>
											<img src={svgs[mmr_to_rank(user.mmr)].default.src} alt="rank" />
										</td>
									</tr>
								))}
							</tbody>
						</table>

						<div className={styles.leaderboard_buttons}>
							<div>
								<button onClick={handlePrevious}>
									<span className="material-symbols-rounded">chevron_left</span>
								</button>
								<button onClick={handleNext}>
									<span className="material-symbols-rounded">chevron_right</span>
								</button>
							</div>
							<p>Showing {first + 1} to {first + 5} of {total} players</p>
						</div>

					</div>

					<div className={styles.separator}></div>
					<div className={styles.all_ranks}>
						{svgs.map((svg, index) => (
							<div key={index}>
								<img src={svg.default.src} alt="rank" />
								<h3>{ranks[index]}</h3>
							</div>
						))}
					</div>
				</div>

			</div>
		</>
	);
}
