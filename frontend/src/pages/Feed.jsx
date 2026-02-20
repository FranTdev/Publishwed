import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Send, Trash2, Edit2, MessageSquare, Plus, X, LogOut, Loader2 } from 'lucide-react';

const CommentItem = ({ comment, messageId, currentUser, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTargetContent, setEditTargetContent] = useState(comment.comment);
    const isOwner = currentUser.id === comment.user_id;

    const handleUpdate = async () => {
        if (!editTargetContent.trim()) return;
        try {
            const updated = await api.updateComment(comment.id, { comment: editTargetContent });
            onUpdate(comment.id, updated);
            setIsEditing(false);
        } catch (err) {
            alert("Error al editar comentario");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("¿Seguro que deseas eliminar este comentario?")) {
            try {
                await api.deleteComment(comment.id);
                onDelete(comment.id);
            } catch (err) {
                alert("Error al eliminar el comentario");
            }
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                    type="text"
                    className="flex-1 outline-none bg-transparent text-sm border-b border-slate-300 px-1 py-1 focus:border-indigo-500 transition-colors"
                    value={editTargetContent}
                    onChange={(e) => setEditTargetContent(e.target.value)}
                    autoFocus
                />
                <button onClick={handleUpdate} className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700 transition">Guardar</button>
                <button onClick={() => setIsEditing(false)} className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition">Cancelar</button>
            </div>
        );
    }

    return (
        <div className="group flex justify-between items-start py-3 px-4 mt-2 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all rounded-br-2xl">
            <div className="flex-1">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                    {comment.user_name || `Usuario #${comment.user_id}`}
                </span>
                <p className="text-sm text-slate-800">{comment.comment}</p>
            </div>
            {isOwner && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2 border-l border-slate-200 pl-3 ml-3">
                    <button onClick={() => setIsEditing(true)} aria-label="Editar comentario" className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} aria-label="Eliminar comentario" className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};


const MessageItem = ({ message, currentUser, onUpdateMessage, onDeleteMessage }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.user_message);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const [newComment, setNewComment] = useState("");

    const isOwner = currentUser.id === message.user_id;

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const data = await api.getComments(message.id);
            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = () => {
        if (!showComments) loadComments();
        setShowComments(!showComments);
    };

    const handleUpdateMsg = async () => {
        if (!editContent.trim()) return;
        try {
            const updated = await api.updateMessage(message.id, { user_message: editContent });
            onUpdateMessage(message.id, updated);
            setIsEditing(false);
        } catch (err) {
            alert(`Error al actualizar el mensaje: ${err.message}`);
        }
    };

    const handleDeleteMsg = async () => {
        if (window.confirm("¿Seguro que deseas eliminar este mensaje?")) {
            try {
                await api.deleteMessage(message.id);
                onDeleteMessage(message.id);
            } catch (err) {
                alert(`Error al eliminar el mensaje: ${err.message}`);
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const added = await api.createComment({ message_id: message.id, comment: newComment });
            setComments([...comments, added]);
            setNewComment("");
        } catch (err) {
            alert(`Error agregando el comentario: ${err.message}`);
        }
    };

    const updateCommentState = (commentId, updatedComment) => {
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
    };

    const deleteCommentState = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-bold text-xs">{(message.user_name || "U").charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{message.user_name || `Usuario #${message.user_id}`}</span>
                    </div>
                    {isOwner && !isEditing && (
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleDeleteMsg} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <textarea
                            className="w-full bg-transparent outline-none resize-none text-slate-800"
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-slate-600 hover:text-slate-800 transition">Cancelar</button>
                            <button onClick={handleUpdateMsg} className="text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">Actualizar</button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-2 text-slate-800 whitespace-pre-wrap">{message.user_message}</p>
                )}
            </div>


            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 transition-colors" onClick={toggleComments}>
                <div className="flex items-center space-x-2 text-slate-600 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>{showComments ? 'Ocultar comentarios' : 'Ver comentarios'}</span>
                </div>
            </div>

            {showComments && (
                <div className="px-5 pb-5 bg-slate-50/50">
                    <div className="space-y-1 mb-4">
                        {loadingComments ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                        ) : comments.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 py-4 italic">No hay comentarios aún.</p>
                        ) : (
                            comments.map(c => (
                                <CommentItem
                                    key={c.id}
                                    comment={c}
                                    messageId={message.id}
                                    currentUser={currentUser}
                                    onUpdate={updateCommentState}
                                    onDelete={deleteCommentState}
                                />
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddComment} className="flex items-center space-x-2 relative mt-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Escribe un comentario..."
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};


export const Feed = () => {
    const { user, logout } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await api.getMessages();
            // Assume latest first
            setMessages(data.reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const added = await api.createMessage({ user_message: newMessage });
            setMessages([added, ...messages]);
            setNewMessage("");
        } catch (err) {
            alert("Error publicando el mensaje");
        }
    };

    const updateMessageState = (msgId, updatedMsg) => {
        setMessages(messages.map(m => m.id === msgId ? updatedMsg : m));
    };

    const deleteMessageState = (msgId) => {
        setMessages(messages.filter(m => m.id !== msgId));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col pt-4 pb-12">
            {/* Header */}
            <header className="max-w-3xl w-full mx-auto px-4 sm:px-6 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-4 z-10">
                    <div>
                        <h1 className="text-xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Community Feed
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Conectado como {user.user_name || 'Usuario'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-slate-100 hover:border-red-100"
                    >
                        <span>Salir</span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 flex-1 flex flex-col">

                {/* Composer */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
                    <form onSubmit={handlePostMessage}>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
                            rows={3}
                            placeholder="¿Qué estás pensando?"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-indigo-600/30"
                            >
                                <span>Publicar</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Feed List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                            <p className="text-sm font-medium">Cargando historias...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-800 mb-1">Aún no hay mensajes</h3>
                            <p className="text-sm">Sé el primero en compartir algo con la comunidad.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <MessageItem
                                key={msg.id}
                                message={msg}
                                currentUser={user}
                                onUpdateMessage={updateMessageState}
                                onDeleteMessage={deleteMessageState}
                            />
                        ))
                    )}
                </div>

            </main>
        </div>
    );
};
