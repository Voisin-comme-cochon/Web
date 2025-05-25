import { Users } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    avatar: string;
    role?: string;
}

interface MembersListProps {
    members: Member[];
    className?: string;
}

export function MembersList({ members, className }: MembersListProps) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#e36f4c]" />
                <h3 className="font-medium text-[#1a2a41]">
                    {members.length} membre{members.length > 1 ? 's' : ''}
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {members.map((member) => (
                    <div key={member.id} className="flex flex-col items-center text-center p-3 rounded-lg bg-[#f2f5f8]">
                        <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
                            <img
                                src={member.avatar || '/placeholder.svg?height=48&width=48'}
                                alt={member.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-sm font-medium text-[#1a2a41] truncate w-full">{member.name}</p>
                        {member.role && <p className="text-xs text-[#1a2a41]/60 truncate w-full">{member.role}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
