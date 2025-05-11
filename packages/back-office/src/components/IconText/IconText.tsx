import {NavLink} from 'react-router-dom';

interface IconTextProps {
    to: string;
    icon: string;
    text: string;
}

const IconText: React.FC<IconTextProps> = ({to, icon, text}) => {
    return (
        <NavLink
            to={to}
            end
            className={({isActive}) =>
                `flex flex-col items-center cursor-pointer transition 
                ${isActive ? 'text-orange font-bold' : 'text-gray-700 hover:text-blue-600'}`
            }
        >
            <span className="material-symbols-outlined text-3xl">{icon}</span>
            <p className="text-sm mt-1">{text}</p>
        </NavLink>
    );
};

export default IconText;
