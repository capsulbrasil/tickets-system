<script setup lang="ts">
import { statusColor, priorityColor, capitalizeText } from '../../utils.js'
</script>
<template>
    <div
        class="tw-bg-[color:var(--theme-background-color-shade-4)] tw-rounded tw-p-3 tw-flex tw-justify-between tw-items-center ">
        <h2>Manual Sistema Capsul</h2>
        <a href="https://wa.me/+553798050282" target="_blank" class="tw-flex tw-items-center">
            Fale conosco
            <aeria-icon icon="phone" style="--icon-size: 1.5rem" class="tw-pl-2"></aeria-icon>
        </a>

    </div>

    <aeria-accordion enumerate :headers="{
        'question-criacao-ticket': 'Como criar um ticket?',
        'question-prioridades': 'Como definir prioridades?',
        'question-status': 'Quais são os status dos tickets?',
    }">
        <template #question-criacao-ticket>
            <ol class="tw-list-decimal tw-list-inside tw-space-y-2">
                <li>Na tela principal clique em <strong>adicionar</strong>.</li>
                <li>Preencha o campo <strong>title</strong> com uma descrição breve do problema ou demanda.</li>
                <li>O <strong>topic</strong> com a categoria que o ticket foi advertido.</li>
                <li>Escolha a <strong>priority</strong> do ticket.</li>
                <li>Insira uma <strong>description</strong> detalhada da situação ou pedido.</li>
                <li>Adicione uma <strong>attached</strong> relevante.</li>
                <li>Clique em <strong>insert</strong> para salvar o ticket no sistema.</li>
            </ol>
        </template>
        <template #question-prioridades>
            <table class="tw-w-full tw-border">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Prioridade</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#539F2B]"><strong>Baixa</strong></td>
                        <td class="tw-py-2 tw-px-4">Use essa opção para demandas não Urgentees que podem esperar para
                            serem resolvidas. São questões que não comprometem a operação.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#B38705]"><strong>Moderada</strong></td>
                        <td class="tw-py-2 tw-px-4">Escolha esta prioridade para questões que têm um impacto moderado,
                            mas que não precisam de resolução imediata.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#F44336]"><strong>Urgente</strong></td>
                        <td class="tw-py-2 tw-px-4">Esta opção deve ser usada para demandas que precisam de atenção
                            imediata, pois podem afetar severamente a operação ou serviços.</td>
                    </tr>
                </tbody>
            </table>
        </template>
        <template #question-status>
            <table class="tw-w-full tw-border">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Status</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#4CAF50]"><strong>Ativo</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi criado e ainda não foi atendido.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#FF9800]"><strong>Reparando</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket está em processo de resolução. Um responsável está
                            trabalhando na demanda.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#2196F3]"><strong>Resolvido</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi concluído e a demanda foi resolvida.</td>
                    </tr>
                </tbody>
            </table>
        </template>
    </aeria-accordion>
</template>