import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../lib/supabaseClient"; // Ensure supabase client is available
import { Users, Trash2, PlusCircle, UserPlus, Check, XCircle, Copy } from 'lucide-react'; // Added Copy icon

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Modal animation variants
const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalContentVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 50 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { scale: 0.9, opacity: 0, y: 50, transition: { duration: 0.2 } },
};

const GroupManagementModal = ({ isOpen, onClose, groups, user, onGroupsUpdated }) => {
    // console.log("GroupManagementModal received groups prop:", groups); // Debugging log
    const [selectedGroupToManage, setSelectedGroupToManage] = useState(null);
    const [inviteeUserId, setInviteeUserId] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [loading, setLoading] = useState(false); // Local loading state for general actions (e.g., delete)
    const [inviteError, setInviteError] = useState("");
    const [actionMessage, setActionMessage] = useState(""); // For success/error messages after actions
    const currentUserId = user?.id;

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedGroupToManage(null);
            setInviteeUserId("");
            setInviteError("");
            setActionMessage("");
            setLoading(false); // Reset loading state on close
        }
    }, [isOpen]);

    // Function to add a member to a group
    const handleAddMember = async () => {
        setInviteError("");
        setActionMessage("");
        if (!inviteeUserId.trim()) {
            setInviteError("Please enter a User ID to invite.");
            return;
        }
        if (!selectedGroupToManage) {
            setInviteError("No group selected for inviting.");
            return;
        }
        if (selectedGroupToManage.members.includes(inviteeUserId.trim())) {
            setInviteError("This user is already a member of this group.");
            return;
        }
        if (inviteeUserId.trim() === currentUserId) {
            setInviteError("You are already a member of this group.");
            return;
        }

        setInviteLoading(true);
        try {
            // Optional: Verify invitee user exists. This assumes a public 'users' table or similar.
            // If you don't have this, consider removing this validation or implementing an alternative.
            // This is crucial for security and UX.
            const { data: existingUser, error: userLookupError } = await supabase
                .from('users') // Assumes a public 'users' table synced with auth.users
                .select('id')
                .eq('id', inviteeUserId.trim())
                .single();

            if (userLookupError || !existingUser) {
                setInviteError("Invited User ID not found or invalid. Please ensure the user exists.");
                return;
            }

            const updatedMembers = [...selectedGroupToManage.members, inviteeUserId.trim()];

            const { error: updateError } = await supabase
                .from('groups')
                .update({ members: updatedMembers })
                .eq('id', selectedGroupToManage.id);

            if (updateError) {
                console.error("Supabase Error adding member:", updateError);
                throw new Error(updateError.message);
            }

            // Update local state to reflect the change immediately
            setSelectedGroupToManage(prev => ({ ...prev, members: updatedMembers }));
            setInviteeUserId(""); // Clear input
            setActionMessage("Member added successfully!");
            if (onGroupsUpdated) onGroupsUpdated(); // Notify parent to refresh data
        } catch (err) {
            console.error("Error adding member:", err);
            setInviteError(`Failed to add member: ${err.message || err.toString()}.`);
        } finally {
            setInviteLoading(false);
        }
    };

    // Function to delete a group
    const handleDeleteGroup = async (groupId) => {
        setActionMessage("");
        setInviteError(""); // Clear any previous invite error
        
        // Simple confirmation using window.confirm - consider replacing with a custom modal for better UX
        const confirmed = window.confirm("Are you sure you want to delete this group? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        setLoading(true); // Set local loading state for delete action
        try {
            const { error: deleteError } = await supabase
                .from('groups')
                .delete()
                .eq('id', groupId)
                .eq('owner_id', currentUserId); // Only owner can delete

            if (deleteError) {
                console.error("Supabase Error deleting group:", deleteError);
                throw new Error(deleteError.message);
            }

            setActionMessage("Group deleted successfully!");
            setSelectedGroupToManage(null); // Close the detail view
            if (onGroupsUpdated) onGroupsUpdated(); // Notify parent to refresh data
        } catch (err) {
            console.error("Error deleting group:", err);
            setActionMessage(`Failed to delete group: ${err.message || err.toString()}.`);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleCopyUserId = () => {
        if (currentUserId) {
            document.execCommand('copy', false, currentUserId); // Deprecated but widely supported in iframes
            setActionMessage("Your User ID copied to clipboard!");
            setTimeout(() => setActionMessage(""), 3000); // Clear message after 3 seconds
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                variants={modalOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={() => !loading && !inviteLoading && onClose()} // Prevent closing while actions are ongoing
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalOverlayVariants}
                />
                <motion.div
                    className="relative w-full max-w-2xl mx-auto my-8 shadow-2xl bg-zinc-900 border-zinc-700 rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
                    variants={modalContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800">
                        <CardTitle className="text-zinc-50">
                            {selectedGroupToManage ? `Manage "${selectedGroupToManage.name}"` : "Manage Your Groups"}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => !loading && !inviteLoading && onClose()} className="text-zinc-400 hover:text-zinc-200 p-1">
                            &times;
                        </Button>
                    </CardHeader>

                    <CardContent className="p-6 flex-1 overflow-y-auto">
                        {actionMessage && (
                            <motion.div
                                className={`mb-4 p-3 rounded-md flex items-center gap-2 text-sm ${actionMessage.includes("successfully") ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {actionMessage.includes("successfully") ? <Check className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                {actionMessage}
                            </motion.div>
                        )}

                        <div className="mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                            <h3 className="text-lg font-semibold text-zinc-50 mb-2">Your User ID</h3>
                            <div className="flex items-center gap-2">
                                <code className="bg-zinc-700 px-3 py-2 rounded text-sm text-yellow-300 flex-1 overflow-x-auto break-all">
                                    {currentUserId || "Loading..."}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyUserId}
                                    className="text-zinc-400 hover:text-zinc-200"
                                    disabled={!currentUserId}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-zinc-500 text-xs mt-2">
                                Share this ID with others so they can invite you to their groups.
                            </p>
                        </div>


                        {!selectedGroupToManage ? (
                            // List of groups
                            <div className="grid gap-4">
                                {groups.length === 0 ? (
                                    <p className="text-zinc-400 text-center py-8">No groups found. Create one first!</p>
                                ) : (
                                    groups.map(group => (
                                        <Card key={group.id} className="bg-zinc-800 border-zinc-700 p-4 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-blue-400" /> {group.name}
                                                </h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Members: {group.members.length} | Created by: {group.owner_id === currentUserId ? "You" : group.owner_id.substring(0, 8) + '...'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedGroupToManage(group)}
                                                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50"
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-1" /> View/Edit
                                                </Button>
                                                {group.owner_id === currentUserId && ( // Only owner can delete
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        disabled={loading} // Now 'loading' is defined!
                                                    >
                                                        {loading ? (
                                                            <motion.div
                                                                className="rounded-full h-4 w-4 border-b-2 border-red-100 animate-spin"
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        ) : (
                            // Manage specific group details
                            <div className="grid gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedGroupToManage(null)}
                                    className="mb-4 self-start border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50"
                                >
                                    &larr; Back to Groups List
                                </Button>

                                <Card className="bg-zinc-800 border-zinc-700 p-4">
                                    <h3 className="text-xl font-bold text-zinc-50 mb-2">{selectedGroupToManage.name}</h3>
                                    <p className="text-zinc-400 text-sm">Group ID: <code className="bg-zinc-700 p-1 rounded text-xs text-yellow-300">{selectedGroupToManage.id}</code></p>
                                    <p className="text-zinc-400 text-sm">Owner: {selectedGroupToManage.owner_id === currentUserId ? "You" : selectedGroupToManage.owner_id.substring(0, 8) + '...'}</p>
                                    <p className="text-zinc-400 text-sm">Created: {new Date(selectedGroupToManage.created_at).toLocaleDateString()}</p>
                                </Card>

                                {/* Members List */}
                                <Card className="bg-zinc-800 border-zinc-700 p-4">
                                    <h4 className="text-lg font-semibold text-zinc-50 mb-3">Current Members ({selectedGroupToManage.members.length})</h4>
                                    <ul className="space-y-2">
                                        {selectedGroupToManage.members.map((memberId, index) => (
                                            <li key={index} className="flex items-center gap-2 text-zinc-300 text-sm">
                                                <Users className="w-4 h-4 text-blue-300" />
                                                {memberId} {memberId === currentUserId ? "(You)" : ""} {memberId === selectedGroupToManage.owner_id ? "(Owner)" : ""}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>

                                {/* Add Member Section */}
                                <Card className="bg-zinc-800 border-zinc-700 p-4">
                                    <h4 className="text-lg font-semibold text-zinc-50 mb-3">Add New Member</h4>
                                    {inviteError && (
                                        <p className="text-red-400 text-sm mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> {inviteError}</p>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Input
                                            id="inviteeUserId"
                                            placeholder="Enter User ID to invite"
                                            value={inviteeUserId}
                                            onChange={(e) => setInviteeUserId(e.target.value)}
                                            className="flex-1 bg-zinc-700 border-zinc-600 text-zinc-100 focus:ring-zinc-50"
                                            disabled={inviteLoading}
                                        />
                                        <Button
                                            onClick={handleAddMember}
                                            disabled={inviteLoading || !inviteeUserId.trim()}
                                            className="bg-green-600 hover:bg-green-700 text-white sm:w-auto w-full"
                                        >
                                            {inviteLoading ? (
                                                <motion.div
                                                    className="rounded-full h-4 w-4 border-b-2 border-green-100 animate-spin"
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                            ) : (
                                                <> <UserPlus className="w-4 h-4 mr-2" /> Add Member </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-zinc-500 text-xs mt-2">
                                        Ask the person to provide their User ID (found in their profile or console).
                                    </p>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t border-zinc-800 flex justify-end">
                        <Button onClick={() => !loading && !inviteLoading && onClose()} variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50">
                            Close
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GroupManagementModal;
