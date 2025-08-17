import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../lib/supabaseClient"; // Ensure supabase client is available
import { Users, Check, XCircle, Search } from 'lucide-react'; // Icons

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Modal animation variants (reusing from other modals for consistency)
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

const JoinGroupModal = ({ isOpen, onClose, user, onGroupJoined }) => {
    const [groupIdToJoin, setGroupIdToJoin] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(""); // For success/error messages
    const [isSuccess, setIsSuccess] = useState(false); // To determine message style
    const currentUserId = user?.id;

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setGroupIdToJoin("");
            setMessage("");
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleJoinGroup = async () => {
        setMessage("");
        setIsSuccess(false);

        if (!groupIdToJoin.trim()) {
            setMessage("Please enter a Group ID.");
            setIsSuccess(false);
            return;
        }
        if (!currentUserId) {
            setMessage("You must be logged in to join a group.");
            setIsSuccess(false);
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch the group to check if it exists and to get current members
            const { data: group, error: fetchError } = await supabase
                .from('groups')
                .select('id, name, members')
                .eq('id', groupIdToJoin.trim())
                .single();

            if (fetchError || !group) {
                setMessage("Group not found or invalid Group ID.");
                setIsSuccess(false);
                return;
            }

            // 2. Check if user is already a member
            if (group.members.includes(currentUserId)) {
                setMessage(`You are already a member of "${group.name}".`);
                setIsSuccess(false);
                return;
            }

            // 3. Add current user to members array
            const updatedMembers = [...group.members, currentUserId];

            const { error: updateError } = await supabase
                .from('groups')
                .update({ members: updatedMembers })
                .eq('id', group.id);

            if (updateError) {
                console.error("Supabase Error joining group:", updateError);
                throw new Error(`Failed to join group: ${updateError.message}`);
            }

            setMessage(`Successfully joined group "${group.name}"!`);
            setIsSuccess(true);
            setGroupIdToJoin(""); // Clear input
            if (onGroupJoined) {
                console.log("JoinGroupModal: Calling onGroupJoined to refresh parent data."); // New log
                onGroupJoined(); // Notify parent to refresh group list and data
            }
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Error joining group:", err);
            setMessage(`Error: ${err.message || "Something went wrong."}`);
            setIsSuccess(false);
        } finally {
            setLoading(false);
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
                    onClick={() => !loading && onClose()} // Prevent closing while loading
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalOverlayVariants}
                />
                <motion.div
                    className="relative w-full max-w-md mx-auto my-8 shadow-2xl bg-zinc-900 border-zinc-700 rounded-xl overflow-hidden"
                    variants={modalContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800">
                        <CardTitle className="text-zinc-50">Join a Group</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => !loading && onClose()} className="text-zinc-400 hover:text-zinc-200 p-1">
                            &times;
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        {message && (
                            <motion.div
                                className={`mb-4 p-3 rounded-md flex items-center gap-2 text-sm ${isSuccess ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isSuccess ? <Check className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                {message}
                            </motion.div>
                        )}
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="groupId" className="text-zinc-300 mb-2 block">Group ID</Label>
                                <Input
                                    id="groupId"
                                    placeholder="Enter the Group ID"
                                    value={groupIdToJoin}
                                    onChange={(e) => setGroupIdToJoin(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-50"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-zinc-400 text-sm">
                                Ask the group owner or an existing member for the Group ID.
                            </p>
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-zinc-800 flex justify-end">
                        <Button
                            onClick={handleJoinGroup}
                            disabled={loading || !currentUserId}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                        >
                            {loading ? (
                                <motion.span
                                    className="flex items-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="rounded-full h-4 w-4 border-b-2 border-purple-100 animate-spin mr-2"
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    /> Joining...
                                </motion.span>
                            ) : (
                                <> <Users className="w-4 h-4 mr-2" /> Join Group </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default JoinGroupModal;
