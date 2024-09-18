<script lang="ts">
import { ref } from 'vue'
export default defineComponent({
    name: 'ManualPanel'
})

const panelVisible = ref(false)
</script>

<template>
    <aeria-panel v-model="panelVisible" fixed-right close-hint title="Manual do Sistema"
        @overlay-click="panelVisible = false">
        <h1 class="tw-font-bold">Manual de Uso do Sistema Capsul</h1>
        <h2 class="tw-font-bold">Sumário</h2>
        <ul class="tw-mt-2 tw-space-y-2">
            <li><a href="#introducao" class="tw-font-bold hover:tw-underline">Introdução</a></li>
            <li><a href="#criacao-ticket" class="tw-font-bold hover:tw-underline">Criação de um Ticket</a></li>
            <li><a href="#prioridades" class="tw-font-bold hover:tw-underline">Definição de Prioridades</a></li>
            <li><a href="#status" class="tw-font-bold hover:tw-underline">Status do Ticket</a></li>
        </ul>
        <div id="introducao">
            <h2 class="tw-font-bold">Introdução</h2>
            <p class="tw-mt-2">Este manual tem como objetivo guiar o usuário no uso do sistema de tickets da Capsul. O
                sistema
                permite criar, visualizar e editar tickets, facilitando o gerenciamento de demandas. Cada ticket contém
                um
                título,
                descrição, prioridade, foto e status, que pode ser atualizado ao longo do tempo.</p>
        </div>
        <div id="criacao-ticket">
            <h2 class="tw-font-bold">Criação de um Ticket</h2>

            <ol class="tw-list-decimal tw-list-inside tw-mt-2 tw-space-y-2">
                <li>Navegue até a página de <strong>Tickets</strong>.</li>
                <li>Preencha o campo <strong>title</strong> com uma descrição breve do problema ou demanda.</li>
                <li>Escolha a <strong>priority</strong> do ticket (veja a seção <a href="#prioridades"><b>Definição de
                            Prioridades</b></a> para mais detalhes).</li>
                <li>Insira uma <strong>description</strong> detalhada da situação ou pedido.</li>
                <li>Adicione uma <strong>attached</strong> relevante.</li>
                <li>Clique em <strong>insert</strong> para salvar o ticket no sistema.</li>
            </ol>
        </div>
        <div id="prioridades">
            <h2 class="tw-font-bold">Definição de Prioridades</h2>
            <table class="tw-w-full tw-border ">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Prioridade</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#539F2B]"><strong>Low</strong></td>
                        <td class="tw-py-2 tw-px-4">Use essa opção para demandas não urgentes que podem esperar para
                            serem
                            resolvidas.
                            São questões que não comprometem a operação.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#B38705]"><strong>Moderate</strong></td>
                        <td class="tw-py-2 tw-px-4">Escolha esta prioridade para questões que têm um impacto moderado,
                            mas que não
                            precisam de resolução imediata.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#F44336]"><strong>Urgent</strong></td>
                        <td class="tw-py-2 tw-px-4">Esta opção deve ser usada para demandas que precisam de atenção
                            imediata, pois
                            podem afetar severamente a operação ou serviços.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="status">
            <h2 class="tw-font-bold">Status do Ticket</h2>
            <table class="tw-w-full tw-border ">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Status</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#4CAF50]"><strong>Open</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi criado e ainda não foi atendido.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#FF9800]"><strong>Repairing</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket está em processo de resolução. Um responsável está
                            trabalhando na
                            demanda.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#2196F3]"><strong>Completed</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi concluído e a demanda foi resolvida.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </aeria-panel>
</template>