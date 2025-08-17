import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../lib/supabaseClient";
import { Plus, Users, Check, XCircle, Copy } from 'lucide-react'; // Added Copy for User ID

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// Animation variants for the modal overlay and content
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

const GroupCreationModal = ({ isOpen, onClose, user, onGroupCreated }) => {
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const currentUserId = user?.id;

    // Reset state when the modal is opened or closed
    useEffect(() => {
        if (isOpen) {
            setGroupName("");
            setError("");
            setSuccessMessage("");
            setLoading(false);
        }
    }, [isOpen]);

    // Handle group creation submission
    const handleCreateGroup = async () => {
        setError("");
        setSuccessMessage("");
        if (!groupName.trim()) {
            setError("Group name cannot be empty.");
            return;
        }
        if (!currentUserId) {
            setError("User not authenticated.");
            return;
        }

        setLoading(true);
        try {
            // Insert the new group into the 'groups' table
            const { data, error: createError } = await supabase
                .from('groups')
                .insert({
                    name: groupName.trim(),
                    owner_id: currentUserId,
                    members: [currentUserId] // Automatically add the creator as the first member
                })
                .select() // Select the newly created row
                .single();

            if (createError) {
                throw new Error(createError.message);
            }

            setSuccessMessage(`Group "${data.name}" created successfully!`);
            setGroupName(""); // Clear the input field
            // Notify the parent component that a new group was created, so it can refresh data
            if (onGroupCreated) {
                onGroupCreated(data);
            }
            // Optionally, close the modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            console.error("Error creating group:", err);
            setError(`Failed to create group: ${err.message || err.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUserId = () => {
        if (currentUserId) {
            document.execCommand('copy', false, currentUserId); // For iframe compatibility
            setSuccessMessage("Your User ID copied to clipboard!");
            setTimeout(() => setSuccessMessage(""), 2000); // Clear message after 2 seconds
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
                        <CardTitle className="text-zinc-50">Create New Group</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => !loading && onClose()} className="text-zinc-400 hover:text-zinc-200 p-1">
                            &times;
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        {error && (
                            <motion.div
                                className="mb-4 p-3 bg-red-900/30 text-red-300 rounded-md flex items-center gap-2 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <XCircle className="w-5 h-5" /> {error}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                className="mb-4 p-3 bg-green-900/30 text-green-300 rounded-md flex items-center gap-2 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Check className="w-5 h-5" /> {successMessage}
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
                                Share this ID with others so they can invite you to their groups or you can invite them.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="groupName" className="text-zinc-300 mb-2 block">Group Name</Label>
                                <Input
                                    id="groupName"
                                    placeholder="e.g., Family Budget, College Roommates"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-50"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4 border-t border-zinc-800">
                        <Button
                            onClick={handleCreateGroup}
                            disabled={loading || !groupName.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        >
                            {loading ? (
                                <motion.span
                                    className="flex items-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="rounded-full h-4 w-4 border-b-2 border-blue-100 animate-spin mr-2"
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    /> Creating...
                                </motion.span>
                            ) : (
                                <> <Plus className="w-4 h-4 mr-2" /> Create Group </>
                            )}
                        </Button>
                    </CardFooter>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GroupCreationModal;
