import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react';
import { getDirtyRooms, registerCleaning } from '../../services/cleaningService';
import { useAuth } from '../../hooks/useAuth';

export default function CleaningPage() {
    const [dirtyRooms, setDirtyRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<number | null>(null);
    const [observations, setObservations] = useState<{ [key: number]: string }>({});
    const { user } = useAuth();

    const fetchDirtyRooms = async () => {
        setLoading(true);
        try {
            const data = await getDirtyRooms();
            setDirtyRooms(data);
        } catch (error) {
            console.error("Error fetching dirty rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirtyRooms();
    }, []);

    const handleRegisterCleaning = async (habitacionId: number) => {
        if (!user) return;

        setRegistering(habitacionId);
        try {
            await registerCleaning({
                usuario_id: user.id,
                habitacion_id: habitacionId,
                observacion: observations[habitacionId] || "",
            });
            // Refresh list
            fetchDirtyRooms();
            // Clear observation for this room
            setObservations(prev => {
                const newObs = { ...prev };
                delete newObs[habitacionId];
                return newObs;
            });
            alert("Limpieza registrada correctamente");
        } catch (error) {
            console.error("Error registering cleaning:", error);
            alert("Error al registrar la limpieza");
        } finally {
            setRegistering(null);
        }
    };

    const handleObservationChange = (habitacionId: number, value: string) => {
        setObservations(prev => ({ ...prev, [habitacionId]: value }));
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 bg-gray-50/50 min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Módulo de Limpieza</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
                        Control de Mantenimiento y Aseo
                    </p>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="transition-all duration-300">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-100 border-t-yellow-600 mb-4"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscando habitaciones sucias...</p>
                    </div>
                ) : (
                    <>
                        {dirtyRooms.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <Sparkles size={48} className="mx-auto text-[#d4af37] mb-4 opacity-20" />
                                <h3 className="text-lg font-black text-gray-400 uppercase">Todas las habitaciones están limpias</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {dirtyRooms.map((hab) => (
                                    <div
                                        key={hab.id}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                    {hab.estado}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 uppercase">PISO {hab.piso}</span>
                                            </div>

                                            <div className="space-y-1 mb-4">
                                                <h3 className="text-3xl font-black text-gray-800 tracking-tighter italic">Nº {hab.numero}</h3>
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{hab.tipo_habitacion}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Observaciones / Incidencias</label>
                                                <select
                                                    value={observations[hab.id] || ""}
                                                    onChange={(e) => handleObservationChange(hab.id, e.target.value)}
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d4af37] outline-none transition-all h-12 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Ninguna</option>
                                                    <option value="A">A - Falta aseo</option>
                                                    <option value="T">T - Falta toallas</option>
                                                    <option value="S">S - Falta sabanas</option>
                                                    <option value="U">U - Falta utencilios</option>
                                                    <option value="E">E - Falta edredon</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleRegisterCleaning(hab.id)}
                                                disabled={registering === hab.id}
                                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg ${registering === hab.id
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-zinc-900 text-white hover:bg-black hover:shadow-zinc-200'
                                                    }`}
                                            >
                                                {registering === hab.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ClipboardCheck size={16} />
                                                )}
                                                <span>{registering === hab.id ? 'Registrando...' : 'Marcar como Limpia'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* DASHBOARD SUMMARY (Optional/Extra) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Por Limpiar</p>
                        <h4 className="text-2xl font-black text-gray-800">{dirtyRooms.length}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
