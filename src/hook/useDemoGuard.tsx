import {useUser} from "../contexts/UserContext";

export function useDemoGuard() {
    const { user } = useUser();

    const demoGuard =
        <Args extends unknown[]>(
            fn: (...args: Args) => void | Promise<void>
        ) =>
            async (...args: Args) => {
                if (user?.email === "demo@example.com") {
                    alert("데모 계정은 이 기능을 사용할 수 없습니다.");
                    return;
                }

                return fn(...args);
            };

    return { demoGuard };
}