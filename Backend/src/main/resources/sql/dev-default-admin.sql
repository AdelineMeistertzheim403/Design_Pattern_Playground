insert into user_accounts (
	username,
	password_hash,
	password_salt,
	created_at,
	role,
	force_password_change
)
select
	'admin',
	'HvzeDQtTQcSXvqf9hHOIve9qusHHAzBleCT1rUcSauA=',
	'uxCDjxa9uKupla11TWRaVw==',
	now(),
	'ADMIN',
	true
where not exists (
	select 1
	from user_accounts
	where username = 'admin'
);
