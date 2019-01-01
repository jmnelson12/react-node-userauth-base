import React, { Component } from "react";
import "./styles/App.css";
import axios from "axios";
import {
	getFromStorage,
	setInStorage,
	removeFromStorage,
	storage_key
} from "./utils/storage";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			token: "",
			signUpError: "",
			signInError: "",
			signInEmail: "",
			signInPassword: "",
			signUpFirstName: "",
			signUpLastName: "",
			signUpEmail: "",
			signUpPassword: ""
		};

		this.onTextboxChangeSignInEmail = this.onTextboxChangeSignInEmail.bind(
			this
		);
		this.onTextboxChangeSignInPassword = this.onTextboxChangeSignInPassword.bind(
			this
		);
		this.onTextboxChangeSignUpFirstName = this.onTextboxChangeSignUpFirstName.bind(
			this
		);
		this.onTextboxChangeSignUpLastName = this.onTextboxChangeSignUpLastName.bind(
			this
		);
		this.onTextboxChangeSignUpEmail = this.onTextboxChangeSignUpEmail.bind(
			this
		);
		this.onTextboxChangeSignUpPassword = this.onTextboxChangeSignUpPassword.bind(
			this
		);
		this.onLogin = this.onLogin.bind(this);
		this.onSignUp = this.onSignUp.bind(this);
		this.logout = this.logout.bind(this);
	}

	componentDidMount() {
		const obj = getFromStorage(storage_key);

		if (obj && obj.token) {
			const { token } = obj;

			axios.get("/verify?token=" + token).then(json => {
				if (json.data.success) {
					this.setState({
						token,
						isLoading: false
					});
				} else {
					this.setState({
						isLoading: false
					});
				}
			});
		} else {
			this.setState({
				isLoading: false
			});
		}
	}

	onTextboxChangeSignInEmail(event) {
		this.setState({
			signInEmail: event.target.value
		});
	}
	onTextboxChangeSignInPassword(event) {
		this.setState({
			signInPassword: event.target.value
		});
	}
	onTextboxChangeSignUpFirstName(event) {
		this.setState({
			signUpFirstName: event.target.value
		});
	}
	onTextboxChangeSignUpLastName(event) {
		this.setState({
			signUpLastName: event.target.value
		});
	}
	onTextboxChangeSignUpEmail(event) {
		this.setState({
			signUpEmail: event.target.value
		});
	}
	onTextboxChangeSignUpPassword(event) {
		this.setState({
			signUpPassword: event.target.value
		});
	}

	onSignUp() {
		// Grab state
		const {
			signUpFirstName,
			signUpLastName,
			signUpEmail,
			signUpPassword
		} = this.state;

		this.setState({
			isLoading: true
		});

		axios
			.post("/signup", {
				firstName: signUpFirstName,
				lastName: signUpLastName,
				email: signUpEmail,
				password: signUpPassword
			})
			.then(json => {
				if (json.data.success) {
					this.setState({
						signUpError: json.data.message,
						isLoading: false,
						signUpEmail: "",
						signUpFirstName: "",
						signUpLastName: "",
						signUpPassword: ""
					});
				} else {
					this.setState({
						signUpError: json.data.message,
						isLoading: false
					});
				}
			});
	}

	onLogin() {
		// Grab state
		const { signInEmail, signInPassword } = this.state;

		// POST request to backend
		this.setState({
			isLoading: true
		});

		axios
			.post("/login", {
				email: signInEmail,
				password: signInPassword
			})
			.then(json => {
				if (json.data.success) {
					setInStorage(storage_key, { token: json.data.token });
					this.setState({
						signInError: json.data.message,
						isLoading: false,
						signInEmail: "",
						signInPassword: "",
						token: json.data.token
					});
				} else {
					this.setState({
						signInError: json.data.message,
						isLoading: false
					});
				}
			});
	}

	logout() {
		this.setState({ isLoading: true });
		const obj = getFromStorage(storage_key);

		if (obj && obj.token) {
			const { token } = obj;

			axios.get("/logout?token=" + token).then(json => {
				if (json.data.success) {
					removeFromStorage(storage_key);
					this.setState({
						token: "",
						isLoading: false
					});
				} else {
					this.setState({
						isLoading: false
					});
				}
			});
		}
	}

	render() {
		const {
			isLoading,
			token,
			signInError,
			signInEmail,
			signInPassword,
			signUpFirstName,
			signUpLastName,
			signUpEmail,
			signUpPassword
		} = this.state;

		if (isLoading) {
			return (
				<div>
					<p>Loading...</p>
				</div>
			);
		}

		if (!token) {
			return (
				<div>
					<div>
						{signInError ? <div>{signInError}</div> : null}
						<p>Sign In</p>
						<input
							type="email"
							placeholder="Email"
							value={signInEmail}
							onChange={this.onTextboxChangeSignInEmail}
						/>
						<br />
						<input
							type="password"
							placeholder="Password"
							value={signInPassword}
							onChange={this.onTextboxChangeSignInPassword}
						/>
						<br />
						<button onClick={this.onLogin}>Sign In</button>
					</div>
					<br />
					<br />
					<div>
						{this.state.signUpError ? (
							<div>{this.state.signUpError}</div>
						) : null}
						<p>Sign Up</p>
						<input
							type="text"
							value={signUpFirstName}
							placeholder="First Name"
							onChange={this.onTextboxChangeSignUpFirstName}
						/>
						<br />
						<input
							type="text"
							value={signUpLastName}
							placeholder="Last Name"
							onChange={this.onTextboxChangeSignUpLastName}
						/>
						<br />
						<input
							type="email"
							value={signUpEmail}
							placeholder="Email"
							onChange={this.onTextboxChangeSignUpEmail}
						/>
						<br />
						<input
							type="password"
							value={signUpPassword}
							placeholder="Password"
							onChange={this.onTextboxChangeSignUpPassword}
						/>
						<br />
						<button onClick={this.onSignUp}>Sign Up</button>
					</div>
				</div>
			);
		}

		return (
			<div>
				<p>Account</p>
				<button onClick={this.logout}>Logout</button>
			</div>
		);
	}
}

export default App;
