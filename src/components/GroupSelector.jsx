import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Users, User } from 'lucide-react'; // Icons

// Animation variants for the selector and its options
const selectorVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
};

const GroupSelector = ({ groups, selectedGroupId, onSelectGroup }) => {
    // Determine the currently selected group's name or "Personal" for display purposes
    const currentSelectionName = selectedGroupId === 'personal'
        ? 'Personal'
        : groups.find(g => g.id === selectedGroupId)?.name || 'Select View'; // Fallback if group not found

    return (
        <div className="relative">
            {/* The main select element for choosing between personal and groups */}
            <motion.select
                value={selectedGroupId}
                onChange={(e) => onSelectGroup(e.target.value)}
                className="
                    appearance-none pr-8 pl-3 py-2
                    bg-zinc-800 border border-zinc-700 rounded-md
                    text-zinc-100 font-medium
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    cursor-pointer shadow-sm
                    flex items-center gap-2
                    transition-all duration-200 ease-in-out
                    hover:bg-zinc-700
                "
                variants={selectorVariants}
                whileHover="hover"
                whileTap="tap"
            >
                {/* Option for viewing personal finances */}
                <option value="personal">Personal</option>
                {/* Map through the groups array to create an option for each group */}
                {groups.map(group => (
                    <option key={group.id} value={group.id}>
                        {group.name} (Group)
                    </option>
                ))}
            </motion.select>
            {/* Chevron icon for visual indication of a dropdown */}
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
    );
};

export default GroupSelector;
