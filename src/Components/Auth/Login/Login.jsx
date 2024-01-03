import {useState} from "react";
import {Form, useNavigate, useNavigation} from 'react-router-dom';
import "./Login.css"
import {login} from "../../../Data/UserData";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {ResponsiveButton} from "../../common";

export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    return await login(username, password);
}

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const navigation = useNavigation();

    const logging =
        navigation.state !== 'idle'
        && navigation.formData != null
        && navigation.formAction === navigation.location?.pathname;

    return (
        <div className="login">
            <h1>Login</h1>
            <Form method='post'>
                <input
                    type="username"
                    placeholder="Email"
                    id='username'
                    name='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    id='password'
                    name='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <ResponsiveButton content='Login' title='Login'/>
                <p onClick={() => {
                    navigate('/reset')
                }}>
                    Forget Password? Click here to reset!
                </p>
                <p onClick={() => {
                    navigate('/register')
                }}>
                    Don't have an account? Register now!
                </p>
            </Form>
        </div>
    );
}

export default Login;